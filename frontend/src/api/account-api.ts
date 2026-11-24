export interface AccountResponse {
  accountId: number;
  name: string;
  number: string;
  balance: string;
  openedAt: string;
}

export interface TransactionResponse {
  transactionId: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: string;
  balanceAfter: string;
  transactedAt: string;
}

interface ApiErrorResponse {
  code?: string;
  message?: string;
}

export class AccountApiError extends Error {
  constructor(readonly code: string, readonly status: number, message: string) {
    super(message);
    this.name = 'AccountApiError';
  }
}

const viteEnv = import.meta.env ?? {};
const baseUrl = (viteEnv.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const demoOwnerId = viteEnv.VITE_DEMO_OWNER_ID || '1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Owner-Id', demoOwnerId);
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  } catch {
    throw new AccountApiError('NETWORK_ERROR', 0, '서버에 연결할 수 없습니다. 백엔드 서버를 확인해 주세요.');
  }

  const body = await response.json().catch(() => null) as ApiErrorResponse | null;
  if (!response.ok) {
    throw new AccountApiError(
      body?.code || 'REQUEST_FAILED',
      response.status,
      body?.message || '요청을 처리할 수 없습니다.'
    );
  }
  return body as T;
}

export const listAccounts = (): Promise<AccountResponse[]> => request('/accounts');

export const getAccount = (accountId: string): Promise<AccountResponse> =>
  request(`/accounts/${encodeURIComponent(accountId)}`);

export const getTransactions = (accountId: string): Promise<TransactionResponse[]> =>
  request(`/accounts/${encodeURIComponent(accountId)}/transactions`);

export const createAccount = (name: string): Promise<AccountResponse> =>
  request('/accounts', { method: 'POST', body: JSON.stringify({ name }) });

export const createTransaction = (
  accountId: string,
  type: TransactionResponse['type'],
  amount: number
): Promise<TransactionResponse> => request(`/accounts/${encodeURIComponent(accountId)}/transactions`, {
  method: 'POST',
  body: JSON.stringify({ type, amount: String(amount) }),
});
