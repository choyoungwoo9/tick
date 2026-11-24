import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccountApiError,
  createAccount as postAccount,
  createTransaction,
  getAccount,
  getTransactions,
  listAccounts,
  type AccountResponse,
  type TransactionResponse,
} from './api/account-api';
import type { BankingState, CashAccount, CashTransaction, TransferKind } from './banking-model';

interface BankingContextValue {
  state: BankingState;
  loading: boolean;
  accountLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  openAccount: (name: string) => Promise<string>;
  selectAccount: (accountId: string) => void;
  transfer: (accountId: string, kind: TransferKind, amount: number, batchId?: string) => Promise<string>;
  requestTwoWithdrawals: (accountId: string, amount: number) => Promise<string>;
}

const BankingContext = createContext<BankingContextValue | null>(null);
const emptyState = (): BankingState => ({ accounts: [], selectedId: null, receipts: [] });

function safeNumber(value: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new AccountApiError('UNSUPPORTED_BALANCE_RANGE', 0, '계좌 금액이 화면에서 표시할 수 있는 범위를 벗어났습니다.');
  }
  return number;
}

function summaryAccount(account: AccountResponse): CashAccount {
  return {
    id: String(account.accountId),
    number: account.number,
    name: account.name,
    openedAt: account.openedAt,
    balance: safeNumber(account.balance),
    transactions: [],
  };
}

function fullAccount(account: AccountResponse, transactions: TransactionResponse[]): CashAccount {
  const ledger: CashTransaction[] = transactions.map(transaction => ({
    id: String(transaction.transactionId),
    kind: transaction.type === 'DEPOSIT' ? 'deposit' as const : 'withdraw' as const,
    amount: safeNumber(transaction.amount),
    balanceAfter: safeNumber(transaction.balanceAfter),
    occurredAt: transaction.transactedAt,
  }));

  return { ...summaryAccount(account), transactions: ledger.reverse() };
}

function apiMessage(error: unknown): string {
  return error instanceof Error ? error.message : '요청을 처리할 수 없습니다.';
}

export function BankingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BankingState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);
  const selectionRequest = useRef(0);

  const commit = (update: (current: BankingState) => BankingState) => {
    const next = update(stateRef.current);
    stateRef.current = next;
    setState(next);
  };

  const loadAccount = async (accountId: string): Promise<CashAccount> => {
    const [account, transactions] = await Promise.all([
      getAccount(accountId),
      getTransactions(accountId),
    ]);
    return fullAccount(account, transactions);
  };

  const reload = async () => {
    setLoading(true);
    setError(null);
    selectionRequest.current += 1;
    try {
      const summaries = await listAccounts();
      const accounts = summaries.map(summaryAccount);
      const previouslySelected = stateRef.current.selectedId;
      const selectedId = accounts.some(account => account.id === previouslySelected)
        ? previouslySelected
        : accounts[0]?.id ?? null;
      const selectedAccount = selectedId ? await loadAccount(selectedId) : null;
      const nextAccounts = selectedAccount
        ? accounts.map(account => account.id === selectedAccount.id ? selectedAccount : account)
        : accounts;
      commit(current => ({ ...current, accounts: nextAccounts, selectedId, receipts: [] }));
      setAccountLoading(false);
    } catch (loadError) {
      setError(apiMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const openAccount = async (name: string): Promise<string> => {
    setError(null);
    const response = await postAccount(name);
    const account = summaryAccount(response);
    selectionRequest.current += 1;
    commit(current => ({
      ...current,
      accounts: [...current.accounts, account],
      selectedId: account.id,
      receipts: [],
    }));
    setAccountLoading(false);
    return account.id;
  };

  const selectAccount = (accountId: string) => {
    if (!stateRef.current.accounts.some(account => account.id === accountId)) return;
    commit(current => ({ ...current, selectedId: accountId }));
    const requestId = ++selectionRequest.current;
    setAccountLoading(true);
    setError(null);
    void loadAccount(accountId)
      .then(account => commit(current => ({
        ...current,
        accounts: current.accounts.map(item => item.id === account.id ? account : item),
      })))
      .catch(loadError => {
        if (requestId === selectionRequest.current) setError(apiMessage(loadError));
      })
      .finally(() => {
        if (requestId === selectionRequest.current) setAccountLoading(false);
      });
  };

  const transfer: BankingContextValue['transfer'] = async (accountId, kind, amount, batchId) => {
    setError(null);
    const requestId = crypto.randomUUID();
    const occurredAt = new Date().toISOString();
    const command = { requestId, accountId, kind, amount, occurredAt, batchId };
    const type: TransactionResponse['type'] = kind === 'deposit' ? 'DEPOSIT' : 'WITHDRAW';

    try {
      await createTransaction(accountId, type, amount);
      const account = await loadAccount(accountId);
      commit(current => ({
        ...current,
        accounts: current.accounts.map(item => item.id === accountId ? account : item),
        receipts: [...current.receipts, {
          ...command,
          status: 'success',
          message: kind === 'deposit' ? '입금이 완료되었어요.' : '출금이 완료되었어요.',
          balanceAfter: account.balance,
        }],
      }));
      return requestId;
    } catch (transferError) {
      if (transferError instanceof AccountApiError && transferError.code === 'INSUFFICIENT_BALANCE') {
        try {
          const account = await loadAccount(accountId);
          commit(current => ({
            ...current,
            accounts: current.accounts.map(item => item.id === accountId ? account : item),
            receipts: [...current.receipts, {
              ...command,
              status: 'rejected',
              message: transferError.message,
              balanceAfter: account.balance,
            }],
          }));
          return requestId;
        } catch (refreshError) {
          setError(apiMessage(refreshError));
          throw refreshError;
        }
      }
      setError(apiMessage(transferError));
      throw transferError;
    }
  };

  const requestTwoWithdrawals = async (accountId: string, amount: number): Promise<string> => {
    const batchId = crypto.randomUUID();
    await transfer(accountId, 'withdraw', amount, batchId);
    await transfer(accountId, 'withdraw', amount, batchId);
    return batchId;
  };

  return <BankingContext.Provider value={{
    state, loading, accountLoading, error, reload, openAccount, selectAccount, transfer, requestTwoWithdrawals,
  }}>{children}</BankingContext.Provider>;
}

export function useBanking() {
  const value = useContext(BankingContext);
  if (!value) throw new Error('BankingProvider is required');
  return value;
}
