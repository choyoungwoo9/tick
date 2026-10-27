/** Browser-only account state. No server or database concurrency is simulated. */
export type TransferKind = 'deposit' | 'withdraw';
export interface CashTransaction {
  id: string; kind: TransferKind; amount: number; balanceAfter: number; occurredAt: string; batchId?: string;
}
export interface CashAccount {
  id: string; number: string; name: string; openedAt: string; balance: number; transactions: CashTransaction[];
}
export interface TransferCommand {
  requestId: string; accountId: string; kind: TransferKind; amount: number; occurredAt: string; batchId?: string;
}
export interface TransferReceipt extends TransferCommand {
  status: 'success' | 'rejected'; message: string; balanceAfter: number | null;
}
export interface BankingState { accounts: CashAccount[]; selectedId: string | null; receipts: TransferReceipt[] }
export type BankingAction =
  | { type: 'open'; accountId: string; number: string; name: string; occurredAt: string }
  | { type: 'select'; accountId: string }
  | { type: 'transfer'; command: TransferCommand }
  | { type: 'batch'; commands: TransferCommand[] }
  | { type: 'reset' };
export const emptyBankingState = (): BankingState => ({ accounts: [], selectedId: null, receipts: [] });
export function transferProblem(account: CashAccount | undefined, kind: TransferKind, amount: number): string | null {
  if (!account) return '입출금할 계좌를 먼저 선택해 주세요.';
  if (!Number.isSafeInteger(amount) || amount <= 0) return '금액은 1원 이상의 정수로 입력해 주세요.';
  if (kind === 'withdraw' && amount > account.balance) return '계좌 잔고를 초과해 출금할 수 없어요.';
  if (kind === 'deposit' && !Number.isSafeInteger(account.balance + amount)) return '처리할 수 있는 금액 범위를 초과했어요.';
  return null;
}
function applyTransfer(state: BankingState, command: TransferCommand): BankingState {
  if (state.receipts.some(receipt => receipt.requestId === command.requestId)) return state;
  const account = state.accounts.find(item => item.id === command.accountId);
  const problem = transferProblem(account, command.kind, command.amount);
  if (problem || !account) return { ...state, receipts: [...state.receipts, {
    ...command, status: 'rejected', message: problem!, balanceAfter: account?.balance ?? null,
  }] };
  const balanceAfter = account.balance + (command.kind === 'deposit' ? command.amount : -command.amount);
  const transaction: CashTransaction = {
    id: command.requestId, kind: command.kind, amount: command.amount,
    balanceAfter, occurredAt: command.occurredAt, batchId: command.batchId,
  };
  return {
    ...state,
    accounts: state.accounts.map(item => item.id === account.id ? {
      ...item, balance: balanceAfter, transactions: [transaction, ...item.transactions],
    } : item),
    receipts: [...state.receipts, {
      ...command, status: 'success', message: command.kind === 'deposit' ? '입금이 완료되었어요.' : '출금이 완료되었어요.', balanceAfter,
    }],
  };
}
export function bankingReducer(state: BankingState, action: BankingAction): BankingState {
  switch (action.type) {
    case 'open': {
      const name = action.name.trim();
      if (!name || name.length > 24 || state.accounts.some(account => account.id === action.accountId)) return state;
      return {
        ...state, selectedId: action.accountId,
        accounts: [...state.accounts, {
          id: action.accountId, number: action.number, name, openedAt: action.occurredAt, balance: 0, transactions: [],
        }],
      };
    }
    case 'select':
      return state.accounts.some(account => account.id === action.accountId) ? { ...state, selectedId: action.accountId } : state;
    case 'transfer': return applyTransfer(state, action.command);
    // Consume the current browser state for each queued request, never a stale copied balance.
    case 'batch': return action.commands.reduce(applyTransfer, state);
    case 'reset': return emptyBankingState();
  }
}
