import { createContext, useContext, useReducer, useRef, type ReactNode } from 'react';
import { bankingReducer, emptyBankingState, type BankingState, type TransferKind } from './mocks/banking';
interface BankingContextValue {
  state: BankingState;
  openAccount: (name: string) => void;
  selectAccount: (accountId: string) => void;
  transfer: (accountId: string, kind: TransferKind, amount: number) => string;
  requestTwoWithdrawals: (accountId: string, amount: number) => string;
  resetBanking: () => void;
}
const BankingContext = createContext<BankingContextValue | null>(null);
export function BankingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bankingReducer, undefined, emptyBankingState);
  const sequence = useRef(1);
  const openAccount = (name: string) => {
    dispatch({ type: 'open', accountId: crypto.randomUUID(), number: `TICK 2000-${String(sequence.current++).padStart(4, '0')}`, name, occurredAt: new Date().toISOString() });
  };
  const transfer: BankingContextValue['transfer'] = (accountId, kind, amount) => {
    const requestId = crypto.randomUUID();
    dispatch({ type: 'transfer', command: { accountId, kind, amount, requestId, occurredAt: new Date().toISOString() } });
    return requestId;
  };
  const requestTwoWithdrawals = (accountId: string, amount: number) => {
    const batchId = crypto.randomUUID();
    const occurredAt = new Date().toISOString();
    dispatch({ type: 'batch', commands: Array.from({ length: 2 }, () => ({ accountId, kind: 'withdraw' as const, amount, batchId, occurredAt, requestId: crypto.randomUUID() })) });
    return batchId;
  };
  const resetBanking = () => { dispatch({ type: 'reset' }); sequence.current = 1; };
  return <BankingContext.Provider value={{ state, openAccount, selectAccount: accountId => dispatch({ type: 'select', accountId }), transfer, requestTwoWithdrawals, resetBanking }}>{children}</BankingContext.Provider>;
}
export function useBanking() {
  const value = useContext(BankingContext);
  if (!value) throw new Error('BankingProvider is required');
  return value;
}
