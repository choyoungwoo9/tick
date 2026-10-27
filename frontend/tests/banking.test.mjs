import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Test the same pure TypeScript reducer as the UI, using the existing compiler.
const source = readFileSync(new URL('../src/mocks/banking.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { bankingReducer: reduce, emptyBankingState } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const at = '2026-10-27T11:00:00.000Z';
const open = (state = emptyBankingState(), id = 'A') => reduce(state, { type: 'open', accountId: id, number: id, name: `계좌 ${id}`, occurredAt: at });
const command = (requestId, kind, amount, accountId = 'A') => ({ requestId, accountId, kind, amount, occurredAt: at });
const transfer = (state, ...args) => reduce(state, { type: 'transfer', command: command(...args) });

function assertLedger(account) {
  let balance = 0;
  for (const row of [...account.transactions].reverse()) {
    balance += row.kind === 'deposit' ? row.amount : -row.amount;
    assert.equal(row.balanceAfter, balance);
    assert.ok(balance >= 0);
  }
  assert.equal(account.balance, balance);
}

test('account starts at zero and has no hidden funding history', () => {
  const state = open();
  assert.equal(state.selectedId, 'A');
  assert.equal(state.accounts[0].balance, 0);
  assert.deepEqual(state.accounts[0].transactions, []);
});

test('deposit and withdrawal update balance and history together', () => {
  let state = transfer(open(), 'deposit', 'deposit', 1_000_000);
  state = transfer(state, 'withdraw', 'withdraw', 700_000);
  assert.equal(state.accounts[0].balance, 300_000);
  assert.equal(state.accounts[0].transactions.length, 2);
  assertLedger(state.accounts[0]);
});

test('zero, negative, fractional and unsafe amounts cannot change account funds', () => {
  for (const kind of ['deposit', 'withdraw']) {
    for (const amount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      const state = transfer(open(), `${kind}-${amount}`, kind, amount);
      assert.equal(state.receipts[0].status, 'rejected');
      assert.equal(state.accounts[0].balance, 0);
      assert.equal(state.accounts[0].transactions.length, 0);
    }
  }
});

test('two queued 700000 withdrawals against 1000000 approve only one', () => {
  const funded = transfer(open(), 'fund', 'deposit', 1_000_000);
  const state = reduce(funded, { type: 'batch', commands: [command('one', 'withdraw', 700_000), command('two', 'withdraw', 700_000)] });
  assert.deepEqual(state.receipts.slice(1).map(r => r.status), ['success', 'rejected']);
  assert.equal(state.accounts[0].balance, 300_000);
  assert.equal(state.accounts[0].transactions.length, 2);
  assertLedger(state.accounts[0]);
});

test('queued deposits retain every amount', () => {
  const state = reduce(open(), { type: 'batch', commands: [command('one', 'deposit', 300_000), command('two', 'deposit', 700_000)] });
  assert.equal(state.accounts[0].balance, 1_000_000);
  assert.equal(state.accounts[0].transactions.length, 2);
  assertLedger(state.accounts[0]);
});

test('a repeated request does not duplicate a balance change or transaction', () => {
  const once = transfer(open(), 'same', 'deposit', 500_000);
  const replay = transfer(once, 'same', 'deposit', 500_000);
  assert.equal(replay, once);
  assert.equal(replay.accounts[0].transactions.length, 1);
});

test('overdraft and deposit overflow preserve funds and history', () => {
  const funded = transfer(open(), 'fund', 'deposit', 1_000_000);
  const denied = transfer(funded, 'overdraw', 'withdraw', 1_000_001);
  assert.equal(denied.accounts[0], funded.accounts[0]);
  const full = transfer(open(), 'maximum', 'deposit', Number.MAX_SAFE_INTEGER);
  const overflow = transfer(full, 'overflow', 'deposit', 1);
  assert.equal(overflow.accounts[0], full.accounts[0]);
  assert.equal(overflow.receipts.at(-1).status, 'rejected');
});

test('accounts are isolated and missing accounts cannot create fund entries', () => {
  let state = open(open(), 'B');
  state = transfer(state, 'fund-A', 'deposit', 100_000, 'A');
  state = transfer(state, 'fund-missing', 'deposit', 100_000, 'missing');
  assert.equal(state.accounts.find(a => a.id === 'A').balance, 100_000);
  assert.equal(state.accounts.find(a => a.id === 'B').balance, 0);
  assert.equal(state.selectedId, 'B');
  assert.equal(state.receipts.at(-1).status, 'rejected');
  state = reduce(state, { type: 'reset' });
  assert.deepEqual(state, emptyBankingState());
});
