export type TransferKind = 'deposit' | 'withdraw';

export interface CashTransaction {
  id: string;
  kind: TransferKind;
  amount: number;
  balanceAfter: number;
  occurredAt: string;
  batchId?: string;
}

export interface CashAccount {
  id: string;
  number: string;
  name: string;
  openedAt: string;
  balance: number;
  transactions: CashTransaction[];
}

export interface TransferCommand {
  requestId: string;
  accountId: string;
  kind: TransferKind;
  amount: number;
  occurredAt: string;
  batchId?: string;
}

export interface TransferReceipt extends TransferCommand {
  status: 'success' | 'rejected';
  message: string;
  balanceAfter: number | null;
}

export interface BankingState {
  accounts: CashAccount[];
  selectedId: string | null;
  receipts: TransferReceipt[];
}

export function transferProblem(account: CashAccount | undefined, kind: TransferKind, amount: number): string | null {
  if (!account) return '입출금할 계좌를 먼저 선택해 주세요.';
  if (!Number.isSafeInteger(amount) || amount <= 0) return '금액은 1원 이상의 정수로 입력해 주세요.';
  if (kind === 'withdraw' && amount > account.balance) return '계좌 잔고를 초과해 출금할 수 없어요.';
  if (kind === 'deposit' && !Number.isSafeInteger(account.balance + amount)) return '처리할 수 있는 금액 범위를 초과했어요.';
  return null;
}
