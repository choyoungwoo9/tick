import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/api/account-api.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

test('계좌 개설은 모의 사용자 헤더와 이름을 전송한다', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ accountId: 3, name: '생활비', number: 'TICK 2000-0003', balance: '0', openedAt: '2026-10-27T11:00:00' }), { status: 201 });
  };

  await api.createAccount('생활비');

  assert.equal(request.url, '/api/accounts');
  assert.equal(new Headers(request.options.headers).get('X-Owner-Id'), '1');
  assert.equal(JSON.parse(request.options.body).name, '생활비');
});

test('입출금 금액은 정수 문자열로 서버에 전송한다', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ transactionId: 7, type: 'DEPOSIT', amount: '500', balanceAfter: '500', transactedAt: '2026-10-27T11:00:00' }), { status: 201 });
  };

  await api.createTransaction('3', 'DEPOSIT', 500);

  assert.equal(request.url, '/api/accounts/3/transactions');
  assert.deepEqual(JSON.parse(request.options.body), { type: 'DEPOSIT', amount: '500' });
});

test('서버 오류 코드를 보존한다', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response(JSON.stringify({ code: 'INSUFFICIENT_BALANCE', message: '잔액 부족' }), { status: 400 });

  await assert.rejects(api.createTransaction('3', 'WITHDRAW', 100), error => {
    assert.equal(error.code, 'INSUFFICIENT_BALANCE');
    assert.equal(error.message, '잔액 부족');
    return true;
  });
});
