import { ArrowRight, Landmark, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useMock } from '../context';
import { account, holdings, money, reservedCash, reservedShares, stockByCode } from '../mocks/data';
import { Button, Change, Panel, Stat, StockIdentity, TableWrap, TextLink, ViewStateContent } from '../components/ui';
import { Sparkline } from '../components/charts';
import { OrdersTable } from '../components/trading';

export default function Assets(){
  const {orders,view,setView,trade,navigate}=useMock();const [range,setRange]=useState('1개월');
  const valuation=holdings.reduce((s,h)=>s+h.quantity*stockByCode(h.code).price,0);
  const cost=holdings.reduce((s,h)=>s+h.quantity*h.average,0);const profit=valuation-cost;
  const reserved=reservedCash(orders);const available=account.cash-reserved;
  const chart=range==='1주일'?[48,52,49,58,55,66,61,76,72,82]:range==='3개월'?[20,31,27,44,35,45,38,55,51,62,57,70,65,80]:[27,33,30,41,38,46,43,55,50,61,57,65,61,75,70,80];
  return <>
    <div className="page-heading"><div><div className="eyebrow">MY PORTFOLIO</div><h1>내 계좌</h1><p>자산부터 진행 중인 주문까지, 한눈에 확인하세요.</p></div><Button variant="primary" icon={<ArrowRight size={16}/>} onClick={()=>navigate('trade')}>주문하기</Button></div>
    <div className="stats-grid"><Stat label="총 보유자산" value={<>{money(account.cash+valuation)}<small>원</small></>} sub={<><Change value={profit} >{profit>=0?'+':''}{money(profit)}원</Change><span className="dim"> 평가손익</span></>} icon={<Landmark size={16}/>}/><Stat label="주문 가능 금액" value={<>{money(available)}<small>원</small></>} sub="새 주문에 사용할 수 있는 현금" icon={<Wallet size={16}/>}/><Stat label="주식 평가금액" value={<>{money(valuation)}<small>원</small></>} sub={`보유 종목 ${holdings.length}개`}/><Stat label="주문 중인 현금" value={<>{money(reserved)}<small>원</small></>} sub="미체결 매수 주문의 예약 금액"/></div>
    <div className="overview-grid"><Panel title="자산 흐름" description="변화를 살펴보는 예시 차트" actions={<div className="segmented compact">{['1주일','1개월','3개월'].map(r=><button key={r} aria-pressed={range===r} className={range===r?'selected':''} onClick={()=>setRange(r)}>{r}</button>)}</div>}>
      <div className="chart-summary"><span>총 보유자산</span><strong>{money(account.cash+valuation)}<small>원</small></strong><span className="chart-label">SAMPLE CHART</span></div><div className="chart-box"><Sparkline series={chart} large/><div className="chart-axis"><span>기간 시작</span><span>기간 중간</span><span>현재</span></div></div>
    </Panel><Panel title="자산 구성" actions={<span className="subtle-label">모의계좌 01</span>}><div className="allocation"><div className="allocation-ring"><div><span>보유자산</span><strong>{money(Math.floor((account.cash+valuation)/10000))}<small>만 원</small></strong></div></div><div className="allocation-legend"><div><span><i className="legend-dot green"/>주식</span><strong>{money(valuation)}원</strong></div><div><span><i className="legend-dot muted"/>현금</span><strong>{money(account.cash)}원</strong></div></div></div><div className="account-strip"><span>{account.name}</span><span>{account.number}</span></div></Panel></div>
    <Panel title="보유 종목" description="미체결 매도 주문의 수량은 매도 가능 수량에서 제외돼요." actions={<span className="count">{holdings.length}종목</span>}>
      <ViewStateContent state={view} onRetry={()=>setView('normal')} emptyAction={<Button onClick={()=>navigate('trade')}>첫 주문 살펴보기</Button>}><TableWrap><table className="data-table"><thead><tr><th>종목</th><th className="number">보유 / 예약</th><th className="number">평균 매수가</th><th className="number">현재가</th><th className="number">평가금액</th><th className="number">평가손익</th><th><span className="sr-only">주문</span></th></tr></thead><tbody>{holdings.map(h=>{const stock=stockByCode(h.code),pnl=(stock.price-h.average)*h.quantity;return <tr key={h.code}><td><StockIdentity stock={stock}/></td><td className="number">{h.quantity}주<small className="cell-sub">예약 {reservedShares(orders,h.code)}주</small></td><td className="number">{money(h.average)}원</td><td className="number">{money(stock.price)}원</td><td className="number emphasis">{money(stock.price*h.quantity)}원</td><td className="number"><span className={pnl>=0?'up':'down'}>{pnl>=0?'+':''}{money(pnl)}원</span><small className={`cell-sub ${pnl>=0?'up':'down'}`}>{pnl>=0?'+':''}{((stock.price/h.average-1)*100).toFixed(2)}%</small></td><td className="row-actions"><Button size="sm" onClick={()=>trade(h.code)}>주문</Button></td></tr>})}</tbody></table></TableWrap></ViewStateContent>
    </Panel>
    <Panel title="최근 주문" actions={<TextLink onClick={()=>navigate('orders')}>전체 내역</TextLink>}><ViewStateContent state={view} onRetry={()=>setView('normal')}><OrdersTable orders={orders.slice(0,3)} compact/></ViewStateContent></Panel>
  </>;
}
