import { ArrowRight, ChevronDown, Info, Minus, Plus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useMock } from '../context';
import { account, holdings, money, reservedCash, reservedShares, stockByCode, stocks, type Side } from '../mocks/data';
import { Badge, Button, Change, Modal, Notice, Panel, StockIdentity, Tabs } from '../components/ui';
import { Sparkline } from '../components/charts';
import { OrdersTable } from '../components/trading';

export default function Trade(){
  const {code,setCode,orders,create,setDetailId,notify,connection}=useMock();const stock=stockByCode(code);
  const [side,setSide]=useState<Side>('buy');const [price,setPrice]=useState(stock.price);const [quantity,setQuantity]=useState(1);
  const [range,setRange]=useState('day');const [confirm,setConfirm]=useState(false);const [error,setError]=useState('');
  const [outcome,setOutcome]=useState<'accepted'|'rejected'|'checking'>('accepted');
  useEffect(()=>{setPrice(stock.price);setQuantity(1);setError('');},[stock.code,stock.price]);
  const availableCash=account.cash-reservedCash(orders);
  const availableShares=(holdings.find(h=>h.code===code)?.quantity??0)-reservedShares(orders,code);
  const maxQuantity=side==='buy'?Math.floor(availableCash/(price||1)):availableShares;
  const total=price*quantity;
  const submit=(event:FormEvent)=>{
    event.preventDefault();
    if(!Number.isSafeInteger(price)||price<=0||!Number.isSafeInteger(quantity)||quantity<=0){setError('가격과 수량을 1 이상의 정수로 입력해 주세요.');return;}
    if(!Number.isSafeInteger(total)){setError('입력 금액이 너무 커요.');return;}
    if(quantity>maxQuantity){setError(side==='buy'?'주문 가능 금액을 초과했어요.':'매도 가능 수량을 초과했어요.');return;}
    setError('');setConfirm(true);
  };
  const complete=()=>{const id=create({code,side,price,quantity,outcome});setConfirm(false);setDetailId(id);notify(outcome==='accepted'?'접수 확정 예시가 추가됐어요. 체결은 발생하지 않습니다.':outcome==='checking'?'결과 확인 중인 주문 예시가 추가됐어요.':'접수 거절 예시가 추가됐어요.');};
  return <>
    <div className="page-heading"><div><div className="eyebrow">PLACE AN ORDER</div><h1>주문하기</h1><p>시세를 살펴보고 지정가 주문을 입력하세요.</p></div><Badge>모의 시장</Badge></div>
    <div className="stock-quick-list">{stocks.slice(0,4).map(s=><button key={s.code} className={code===s.code?'selected':''} onClick={()=>setCode(s.code)}><StockIdentity stock={s} compact/><span>{money(s.price)}</span><Change value={s.change}/></button>)}</div>
    {connection!=='connected'&&<Notice tone="warning">시세 연결이 지연되고 있어요. 표시 가격이 최신이 아닐 수 있으니 주문 가격을 직접 확인해 주세요.</Notice>}
    <div className="trade-layout"><div className="trade-main">
      <Panel className="quote-panel"><div className="quote-header"><div><StockIdentity stock={stock}/><div className="quote-price">{money(stock.price)}<small>원</small></div><div className="quote-change"><Change value={stock.change}/><span>전일 대비 · 예시</span></div></div><div className="quote-meta"><div><span>거래량</span><strong>{stock.volume}주</strong></div><div><span>시세 기준</span><strong>14:32:06</strong></div></div></div><div className="quote-chart-tabs"><Tabs value={range} onChange={setRange} items={[{value:'day',label:'1일'},{value:'week',label:'1주'},{value:'month',label:'1개월'}]}/><span className="subtle-label">가격 추이 예시</span></div><div className="chart-box quote-chart"><Sparkline series={range==='day'?stock.series:range==='week'?[...stock.series].reverse():stock.series.slice(0,12)} large/><div className="chart-axis"><span>{range==='day'?'09:00':'기간 시작'}</span><span>{range==='day'?'11:00':'기간 중간'}</span><span>{range==='day'?'13:00':''}</span><span>{range==='day'?'15:30':'현재'}</span></div></div></Panel>
      <div className="trade-bottom"><Panel title="호가" description="가격을 누르면 주문 가격에 적용돼요." actions={<Badge>5단계 예시</Badge>}><div className="book-head"><span>매도 잔량</span><span>가격</span><span>매수 잔량</span></div><div className="order-book">{[5,4,3,2,1,0,-1,-2,-3,-4].map((offset,i)=>{const sell=offset>0;const amount=[824,1206,628,943,1524,1846,1024,1368,582,764][i];const p=stock.price+offset*100;return <button key={offset} className={`book-row ${sell?'ask':'bid'} ${price===p?'selected':''}`} onClick={()=>setPrice(p)} aria-label={`${money(p)}원 주문 가격 선택`}><span className="book-volume">{sell&&money(amount)}{sell&&<i style={{width:`${amount/20}%`}}/>}</span><strong>{money(p)}</strong><span className="book-volume">{!sell&&money(amount)}{!sell&&<i style={{width:`${amount/20}%`}}/>}</span></button>})}</div><div className="book-footer"><span>매도 5,125</span><span>잔량 단위: 주</span><span>매수 5,584</span></div></Panel>
      <Panel title="최근 체결" actions={<span className="subtle-label">예시</span>}><div className="trade-tape"><div className="tape-header"><span>시각</span><span>체결가</span><span>수량</span></div>{[0,1,2,3,4,5,6,7].map((n)=><div key={n}><span className="dim">{n<7?`14:32:${String(6-n).padStart(2,'0')}`:'14:31:59'}</span><strong className={n%3?'up':'down'}>{money(stock.price+(n%3-1)*100)}</strong><span>{[12,5,20,3,8,14,2,10][n]}주</span></div>)}</div></Panel></div>
    </div><aside className="order-ticket"><Panel title="주문 입력" actions={<Badge tone="green">모의투자</Badge>}><form onSubmit={submit}>
      <div className="ticket-account"><span>{account.name}</span><small>{account.number}</small><ChevronDown size={15}/></div>
      <label className="field">종목<select aria-label="주문 종목" value={code} onChange={e=>setCode(e.target.value)}>{stocks.map(s=><option key={s.code} value={s.code}>{s.name} · {s.code}</option>)}</select></label>
      <div className={`side-switch ${side}`} role="group" aria-label="매수 매도 선택"><button type="button" aria-pressed={side==='buy'} className={side==='buy'?'selected':''} onClick={()=>{setSide('buy');setError('');}}>매수</button><button type="button" aria-pressed={side==='sell'} className={side==='sell'?'selected':''} onClick={()=>{setSide('sell');setError('');}}>매도</button></div>
      <div className="order-type"><span>주문 방식</span><Badge>지정가</Badge></div>
      <label className="field">주문 가격<div className="number-input"><button type="button" aria-label="주문 가격 100원 줄이기" onClick={()=>setPrice(p=>Math.max(1,p-100))}><Minus size={15}/></button><input aria-label="주문 가격" type="number" inputMode="numeric" min="1" step="1" value={price||''} onChange={e=>setPrice(Number(e.target.value))}/><span>원</span><button type="button" aria-label="주문 가격 100원 늘리기" onClick={()=>setPrice(p=>p+100)}><Plus size={15}/></button></div></label>
      <label className="field">주문 수량<div className="number-input"><button type="button" aria-label="주문 수량 줄이기" onClick={()=>setQuantity(q=>Math.max(1,q-1))}><Minus size={15}/></button><input aria-label="주문 수량" type="number" inputMode="numeric" min="1" step="1" value={quantity||''} onChange={e=>setQuantity(Number(e.target.value))}/><span>주</span><button type="button" aria-label="주문 수량 늘리기" onClick={()=>setQuantity(q=>q+1)}><Plus size={15}/></button></div></label>
      <div className="quantity-shortcuts">{[.25,.5,1].map(r=><button type="button" key={r} onClick={()=>setQuantity(Math.max(0,Math.floor(maxQuantity*r)))}>{r===1?'최대':`${r*100}%`}</button>)}</div>
      <div className="ticket-available"><span>{side==='buy'?'주문 가능 금액':'매도 가능 수량'}</span><strong>{side==='buy'?`${money(availableCash)}원`:`${availableShares}주`}</strong></div>
      <div className="ticket-total"><span>예상 주문 금액</span><strong>{money(total)}<small>원</small></strong></div>
      {error&&<p className="field-error" role="alert">{error}</p>}
      <Button className={`order-submit ${side}`} variant="primary" type="submit" icon={<ArrowRight size={16}/>}>{stock.name} {side==='buy'?'매수':'매도'}하기</Button>
      <p className="ticket-help"><Info size={14}/>접수와 체결은 달라요. 체결 전까지 주문 자산이 예약돼요.</p>
      <details className="preview-options"><summary>접수 결과 미리보기</summary><label className="field">다음 주문의 예시 결과<select aria-label="다음 주문의 예시 결과" value={outcome} onChange={e=>setOutcome(e.target.value as typeof outcome)}><option value="accepted">접수 확정</option><option value="rejected">접수 거절</option><option value="checking">응답 유실 · 결과 확인 중</option></select></label></details>
    </form></Panel></aside></div>
    <Panel title="이 종목의 주문" description="전체 내역은 주문·체결 메뉴에서 확인할 수 있어요."><OrdersTable orders={orders.filter(o=>o.code===code).slice(0,3)} compact/></Panel>
    {confirm&&<Modal title={`${stock.name} ${side==='buy'?'매수':'매도'} 주문을 확인해 주세요`} description="확인하면 선택한 목 접수 결과를 보여드려요." onClose={()=>setConfirm(false)}><div className="modal-body"><StockIdentity stock={stock}/><dl className="detail-list"><div><dt>주문 방식</dt><dd>지정가 {side==='buy'?'매수':'매도'}</dd></div><div><dt>주문 가격</dt><dd>{money(price)}원</dd></div><div><dt>주문 수량</dt><dd>{quantity}주</dd></div><div className="total-line"><dt>주문 금액</dt><dd>{money(total)}원</dd></div></dl><Notice>수수료·세금은 이 화면 초안에 반영하지 않았어요. 실제 주문이나 체결은 발생하지 않습니다.</Notice></div><div className="modal-footer"><Button onClick={()=>setConfirm(false)}>돌아가기</Button><Button variant="primary" onClick={complete}>주문 확인</Button></div></Modal>}
  </>;
}
