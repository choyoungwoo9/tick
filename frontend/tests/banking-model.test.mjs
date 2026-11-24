import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/banking-model.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { transferProblem } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const account = { id: '1', number: 'TICK 2000-0001', name: '생활비', openedAt: '2026-10-27T11:00:00', balance: 1_000_000, transactions: [] };

test('입출금 폼은 양의 정수만 허용한다', () => {
  for (const amount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(transferProblem(account, 'deposit', amount), '금액은 1원 이상의 정수로 입력해 주세요.');
  }
});

test('현재 잔액을 초과하는 출금은 폼에서 안내한다', () => {
  assert.equal(transferProblem(account, 'withdraw', 1_000_001), '계좌 잔고를 초과해 출금할 수 없어요.');
  assert.equal(transferProblem(account, 'withdraw', 1_000_000), null);
});

test('입금으로 안전한 정수 범위를 넘기지 않는다', () => {
  const nearlyFull = { ...account, balance: Number.MAX_SAFE_INTEGER };
  assert.equal(transferProblem(nearlyFull, 'deposit', 1), '처리할 수 있는 금액 범위를 초과했어요.');
});

test('계좌가 선택되지 않았으면 입출금을 막는다', () => {
  assert.equal(transferProblem(undefined, 'deposit', 1), '입출금할 계좌를 먼저 선택해 주세요.');
});
