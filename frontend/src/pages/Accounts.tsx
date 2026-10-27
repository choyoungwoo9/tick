import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, FlaskConical, Landmark, Plus, Wallet, XCircle } from 'lucide-react';
import { useBanking } from '../banking-context';
import { money } from '../mocks/data';
import { transferProblem, type TransferKind } from '../mocks/banking';
import { Badge, Button, EmptyState, Modal, Notice, Panel, Stat, TableWrap, Tabs } from '../components/ui';
import './accounts.css';

const formatDate = (value: string) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
}).format(new Date(value));
const amountValue = (value: string) => /^\d+$/.test(value) ? Number(value) : NaN;
const kindLabel = (kind: TransferKind) => kind === 'deposit' ? '입금' : '출금';

export default function Accounts() {
  const { state, openAccount, selectAccount, transfer, requestTwoWithdrawals } = useBanking();
  const account = state.accounts.find(item => item.id === state.selectedId);
  const [modal, setModal] = useState<'open' | 'confirm' | 'result' | null>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [kind, setKind] = useState<TransferKind>('deposit');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState<{ accountId: string; kind: TransferKind; amount: number } | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [batchAmount, setBatchAmount] = useState('700000');
  const [batchError, setBatchError] = useState('');
  const [batchId, setBatchId] = useState<string | null>(null);
  const historyRef = useRef<HTMLElement>(null);
  const batchRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    setAmount(''); setError(''); setFilter('all'); setReceiptId(null); setBatchId(null); setBatchError('');
  }, [state.selectedId]);

  const receipt = state.receipts.find(item => item.requestId === receiptId);
  const batchReceipts = state.receipts.filter(item => item.batchId === batchId && item.accountId === account?.id);
  const draftAccount = state.accounts.find(item => item.id === draft?.accountId);
  const total = (type: TransferKind) => account?.transactions.filter(item => item.kind === type).reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const transactions = account?.transactions.filter(item => filter === 'all' || item.kind === filter) ?? [];

  const showOpen = () => { setName(`나의 모의계좌 ${state.accounts.length + 1}`); setNameError(''); setModal('open'); };
  const submitOpen = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || name.trim().length > 24) { setNameError('계좌 이름을 1~24자로 입력해 주세요.'); return; }
    openAccount(name.trim()); setModal(null); setKind('deposit');
  };
  const submitTransfer = (event: FormEvent) => {
    event.preventDefault();
    const value = amountValue(amount);
    const problem = transferProblem(account, kind, value);
    if (problem) { setError(problem); return; }
    setError(''); setDraft({ accountId: account!.id, kind, amount: value }); setModal('confirm');
  };
  const confirmTransfer = () => {
    if (!draft) return;
    setReceiptId(transfer(draft.accountId, draft.kind, draft.amount)); setModal('result');
  };
  const submitBatch = (event: FormEvent) => {
    event.preventDefault();
    const value = amountValue(batchAmount);
    if (!account) return;
    if (!Number.isSafeInteger(value) || value <= 0) { setBatchError('요청당 출금 금액을 1원 이상의 정수로 입력해 주세요.'); return; }
    setBatchError(''); setBatchId(requestTwoWithdrawals(account.id, value));
  };
  const beginDeposit = () => { setKind('deposit'); document.getElementById('cash-amount')?.focus(); };

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">ACCOUNT MANAGEMENT</div><h1>계좌 관리</h1><p>모의 계좌를 개설하고 자금의 입출금과 잔고를 확인하세요.</p></div>
      <Button variant="primary" icon={<Plus size={16} />} onClick={showOpen}>모의 계좌 개설</Button>
    </div>
    <Notice>여기서 개설한 계좌는 입출금용 모의 계좌예요. 기존 거래 화면의 예시 계좌와 별도로 관리되며, 새로고침하면 초기화됩니다.</Notice>

    {!account ? <Panel>
      <div className="banking-welcome">
        <span className="banking-welcome-icon"><Landmark size={30} strokeWidth={1.5} /></span>
        <Badge tone="green">모의 계좌</Badge>
        <h2>나의 모의 계좌를 개설해 보세요</h2>
        <p>잔고 0원에서 시작해 원하는 금액을 입금하고,<br />출금 후 잔고와 입출금 내역을 확인할 수 있어요.</p>
        <Button variant="primary" onClick={showOpen}>첫 모의 계좌 개설하기</Button>
      </div>
      <div className="banking-steps">{[
        ['01', '계좌 개설', '계좌 이름을 정하고 0원으로 시작해요.'],
        ['02', '모의 자금 입출금', '원하는 금액을 입금하거나 출금해요.'],
        ['03', '잔고와 내역 확인', '각 거래 이후 잔고를 확인해요.'],
      ].map(([step, title, description]) => <div key={step}><span>{step}</span><strong>{title}</strong><p>{description}</p></div>)}</div>
    </Panel> : <>
      <div className="banking-account-bar">
        <span className="banking-account-icon"><Landmark size={21} /></span>
        <label>선택 계좌<select aria-label="입출금 계좌 선택" value={account.id} onChange={event => selectAccount(event.target.value)}>
          {state.accounts.map(item => <option key={item.id} value={item.id}>{item.name} · {item.number}</option>)}
        </select></label>
        <div className="banking-account-meta"><Badge tone="green">개설 완료</Badge><span>소유자 김틱 · {formatDate(account.openedAt)} 개설</span></div>
      </div>
      <div className="stats-grid banking-stats">
        <Stat label="현재 잔고" value={<>{money(account.balance)}<small>원</small></>} sub="선택 계좌의 모의 현금" icon={<Wallet size={16} />} />
        <Stat label="누적 입금" value={<>{money(total('deposit'))}<small>원</small></>} sub={`입금 ${account.transactions.filter(item => item.kind === 'deposit').length}건`} icon={<ArrowDownLeft size={16} />} />
        <Stat label="누적 출금" value={<>{money(total('withdraw'))}<small>원</small></>} sub={`출금 ${account.transactions.filter(item => item.kind === 'withdraw').length}건`} icon={<ArrowUpRight size={16} />} />
      </div>
      <div className="banking-content-grid">
        <Panel title="자금 입출금" description="입금·출금 결과가 잔고와 내역에 함께 반영돼요." className="banking-transfer-panel">
          <form onSubmit={submitTransfer} noValidate>
            <Tabs label="입금 출금 선택" value={kind} onChange={value => { setKind(value as TransferKind); setError(''); }} items={[{ value: 'deposit', label: '입금' }, { value: 'withdraw', label: '출금' }]} />
            <label className="field banking-amount-label" htmlFor="cash-amount">{kindLabel(kind)} 금액</label>
            <div className={`banking-amount-input ${error ? 'has-error' : ''}`}>
              <input id="cash-amount" aria-label={`${kindLabel(kind)} 금액`} inputMode="numeric" autoComplete="off" value={amount} placeholder="금액 입력" onChange={event => { setAmount(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'cash-amount-error' : undefined} />
              <span>원</span>
            </div>
            <div className="banking-shortcuts">
              {[10_000, 100_000, 1_000_000].map(value => <button key={value} type="button" onClick={() => { setAmount(String((Number.isSafeInteger(amountValue(amount)) ? amountValue(amount) : 0) + value)); setError(''); }}>+{money(value / 10_000)}만</button>)}
              {kind === 'withdraw' && <button type="button" onClick={() => { setAmount(String(account.balance)); setError(''); }}>전액</button>}
            </div>
            {error && <p id="cash-amount-error" className="field-error" role="alert">{error}</p>}
            <div className="banking-balance-line"><span>현재 잔고</span><strong>{money(account.balance)}원</strong></div>
            <Button type="submit" variant="primary" className="banking-submit">{kindLabel(kind)} 내용 확인</Button>
            <p className="helper-text">모의 자금의 증감만 반영해요. 실제 은행으로 돈이 이동하지 않으며, 주문 자산 예약과는 연결되어 있지 않아요.</p>
          </form>
        </Panel>
        <section ref={historyRef} className="banking-history" aria-label="입출금 내역">
          <Panel title="입출금 내역" description={`${account.number} · 성공한 입출금만 표시해요.`} actions={<span className="count">{account.transactions.length}건</span>}>
            <div className="banking-history-tabs"><Tabs label="입출금 내역 필터" value={filter} onChange={setFilter} items={[
              { value: 'all', label: '전체' }, { value: 'deposit', label: '입금' }, { value: 'withdraw', label: '출금' },
            ]} /></div>
            {transactions.length ? <TableWrap><table className="data-table banking-ledger"><thead><tr><th>시각 / 내역</th><th>구분</th><th className="number">금액</th><th className="number">거래 후 잔고</th></tr></thead><tbody>
              {transactions.map(item => <tr key={item.id}>
                <td><span className="mono">{formatDate(item.occurredAt)}</span><small className="cell-sub">{item.batchId ? '출금 2건 요청 시연' : '모의 자금 ' + kindLabel(item.kind)}</small></td>
                <td><Badge tone={item.kind === 'deposit' ? 'green' : 'neutral'}>{kindLabel(item.kind)}</Badge></td>
                <td className={`number ${item.kind === 'deposit' ? 'banking-deposit' : ''}`}>{item.kind === 'deposit' ? '+' : '-'}{money(item.amount)}원</td>
                <td className="number emphasis">{money(item.balanceAfter)}원</td>
              </tr>)}
            </tbody></table></TableWrap> : <EmptyState title={filter === 'all' ? '아직 입출금 내역이 없어요' : `${kindLabel(filter as TransferKind)} 내역이 없어요`} description="완료된 거래의 금액과 거래 후 잔고가 이곳에 표시돼요." action={filter !== 'withdraw' ? <Button onClick={beginDeposit}>입금 금액 입력</Button> : undefined} />}
            <div className="table-footer"><span>누적 입금 − 누적 출금 = {money(account.balance)}원</span><span>거절된 요청은 내역에 반영되지 않아요.</span></div>
          </Panel>
        </section>
      </div>

      <details ref={batchRef} className="banking-batch">
        <summary><span className="banking-batch-icon"><FlaskConical size={18} /></span><span><strong>동시 출금 요청 시나리오</strong><small>같은 계좌에 출금 두 건을 함께 요청하는 목 동작을 확인해요.</small></span><span className="banking-expand">펼치기</span></summary>
        <div className="banking-batch-body">
          <Notice tone="warning">브라우저가 두 요청을 최신 잔고에 차례로 반영하는 시연입니다. 실제 병렬 요청·서버·DB의 동시성 보장을 검증하는 기능은 아니에요.</Notice>
          <p className="banking-example">예: 잔고 <strong>1,000,000원</strong>에서 <strong>700,000원씩 두 건</strong>을 요청하면 한 건만 성공하고 잔고는 <strong>300,000원</strong>이 남아야 해요.</p>
          <form onSubmit={submitBatch} noValidate className="banking-batch-form">
            <label className="field">요청당 출금 금액<input aria-label="요청당 출금 금액" value={batchAmount} inputMode="numeric" onChange={event => { setBatchAmount(event.target.value); setBatchError(''); }} aria-invalid={!!batchError} aria-describedby={batchError ? 'batch-amount-error' : undefined} /></label>
            <Button type="submit" variant="secondary">출금 2건 함께 요청</Button>
          </form>
          {batchError && <p id="batch-amount-error" className="field-error" role="alert">{batchError}</p>}
          <p className="helper-text">선택 계좌에 실제로 목 출금이 반영돼요. 성공한 요청만 잔고와 입출금 내역에 남습니다.</p>
          {!!batchReceipts.length && <div className="banking-batch-result" role="status">
            <div className="banking-result-heading"><strong>요청 결과</strong><span>성공 {batchReceipts.filter(item => item.status === 'success').length}건 · 거절 {batchReceipts.filter(item => item.status === 'rejected').length}건</span></div>
            {batchReceipts.map((item, index) => <div className="banking-request-row" key={item.requestId}>
              <span className={`banking-receipt-icon ${item.status}`}>{item.status === 'success' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}</span>
              <div><strong>요청 {index + 1} · {money(item.amount)}원 출금</strong><p>{item.message}</p></div>
              <div className="banking-request-balance"><Badge tone={item.status === 'success' ? 'green' : 'red'}>{item.status === 'success' ? '성공' : '거절'}</Badge><small>처리 후 {money(item.balanceAfter ?? 0)}원</small></div>
            </div>)}
          </div>}
        </div>
      </details>
    </>}

    {modal === 'open' && <Modal title="모의 계좌 개설" description="이름을 정하면 잔고 0원의 계좌가 개설돼요." onClose={() => setModal(null)}>
      <form onSubmit={submitOpen} noValidate>
        <div className="modal-body">
          <label className="field">계좌 이름<input aria-label="계좌 이름" value={name} maxLength={24} onChange={event => { setName(event.target.value); setNameError(''); }} placeholder="예: 나의 첫 모의계좌" aria-invalid={!!nameError} aria-describedby={nameError ? 'account-name-error' : undefined} /></label>
          {nameError && <p id="account-name-error" className="field-error" role="alert">{nameError}</p>}
          <dl className="detail-list"><div><dt>소유자</dt><dd>김틱 · 예시 사용자</dd></div><div><dt>초기 잔고</dt><dd>0원</dd></div><div><dt>계좌 용도</dt><dd>모의 자금 입출금</dd></div></dl>
          <Notice>초기 자금은 개설 후 직접 입금할 수 있어요. 기존 주식 거래 예시 계좌에는 영향을 주지 않아요.</Notice>
        </div>
        <div className="modal-footer"><Button type="button" onClick={() => setModal(null)}>돌아가기</Button><Button type="submit" variant="primary">계좌 개설 확인</Button></div>
      </form>
    </Modal>}
    {modal === 'confirm' && draft && draftAccount && <Modal title={`${kindLabel(draft.kind)} 내용을 확인해 주세요`} description={draftAccount.name + ' · ' + draftAccount.number} onClose={() => setModal(null)}>
      <div className="modal-body"><dl className="detail-list"><div><dt>현재 잔고</dt><dd>{money(draftAccount.balance)}원</dd></div><div><dt>{kindLabel(draft.kind)} 금액</dt><dd>{money(draft.amount)}원</dd></div><div className="total-line"><dt>예상 처리 후 잔고</dt><dd>{money(draftAccount.balance + (draft.kind === 'deposit' ? draft.amount : -draft.amount))}원</dd></div></dl><Notice>모의 자금의 {kindLabel(draft.kind)}이며 실제 은행 거래가 발생하지 않아요.</Notice></div>
      <div className="modal-footer"><Button onClick={() => setModal(null)}>돌아가기</Button><Button variant="primary" onClick={confirmTransfer}>{kindLabel(draft.kind)} 확인</Button></div>
    </Modal>}
    {modal === 'result' && receipt && <Modal title={receipt.message} description={receipt.status === 'success' ? '잔고와 입출금 내역에 함께 반영했어요.' : '잔고와 입출금 내역은 변경되지 않았어요.'} onClose={() => setModal(null)}>
      <div className="modal-body"><div className={`banking-complete-icon ${receipt.status}`}>{receipt.status === 'success' ? <CheckCircle2 size={30} /> : <XCircle size={30} />}</div><dl className="detail-list"><div><dt>요청 금액</dt><dd>{kindLabel(receipt.kind)} {money(receipt.amount)}원</dd></div><div><dt>처리 시각</dt><dd>{formatDate(receipt.occurredAt)}</dd></div><div className="total-line"><dt>처리 후 잔고</dt><dd>{money(receipt.balanceAfter ?? 0)}원</dd></div></dl></div>
      <div className="modal-footer"><Button variant="primary" onClick={() => { setModal(null); setFilter('all'); historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>내역 확인</Button></div>
    </Modal>}
  </>;
}
