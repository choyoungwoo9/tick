import { useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { useMock } from '../context';
import { money, reservedCash, stockByCode } from '../mocks/data';
import { EmptyState, Panel, SearchField, Stat, StockIdentity, TableWrap, Tabs, ViewStateContent } from '../components/ui';
import { OrdersTable } from '../components/trading';

export default function Orders(){
  const {orders,view,setView,setDetailId}=useMock();const [tab,setTab]=useState('orders');const [filter,setFilter]=useState('all');const [query,setQuery]=useState('');
  const working=orders.filter(o=>['accepted','pending','partial'].includes(o.status));
  const filtered=orders.filter(o=>(stockByCode(o.code).name.toLowerCase().includes(query.toLowerCase())||o.id.toLowerCase().includes(query.toLowerCase()))&&(filter==='all'||(filter==='working'?['accepted','pending','partial'].includes(o.status):o.status===filter)));
  const fills=orders.flatMap(o=>o.fills.map(f=>({...f,order:o})));
  const visibleFills=fills.filter(f=>stockByCode(f.order.code).name.toLowerCase().includes(query.toLowerCase())||f.order.id.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="page-heading"><div><div className="eyebrow">ORDER HISTORY</div><h1>주문 · 체결</h1><p>접수부터 체결과 취소까지, 주문의 진행 상황을 확인하세요.</p></div><span className="date-pill"><CalendarDays size={15}/>2026.10.25</span></div>
    <div className="stats-grid"><Stat label="진행 중인 주문" value={<>{working.length}<small>건</small></>} sub="미체결 · 부분 체결 · 접수 확정"/><Stat label="체결 내역" value={<>{fills.length}<small>건</small></>} sub="한 주문에서 여러 번 체결될 수 있어요"/><Stat label="예약 중인 현금" value={<>{money(reservedCash(orders))}<small>원</small></>} sub="미체결 매수 주문 기준"/><Stat label="결과 확인 필요" value={<>{orders.filter(o=>o.status==='checking').length}<small>건</small></>} sub="접수 결과를 다시 확인해 주세요"/></div>
    <Panel><div className="table-toolbar"><Tabs value={tab} onChange={setTab} items={[{value:'orders',label:'주문 내역',count:orders.length},{value:'fills',label:'체결 내역',count:fills.length},{value:'assets',label:'자산 변동'}]}/><SearchField value={query} onChange={setQuery} placeholder="종목명 또는 주문번호 검색"/></div>
    {tab==='orders'&&<div className="filter-bar"><Filter size={14}/>{[{v:'all',l:'전체'},{v:'working',l:'진행 중'},{v:'filled',l:'전량 체결'},{v:'cancelled',l:'취소'},{v:'rejected',l:'거절'},{v:'checking',l:'결과 확인 중'}].map(item=><button key={item.v} aria-pressed={filter===item.v} className={filter===item.v?'selected':''} onClick={()=>setFilter(item.v)}>{item.l}</button>)}</div>}
    <ViewStateContent state={view} onRetry={()=>setView('normal')}>
      {tab==='orders'?<OrdersTable orders={filtered}/>:<>{visibleFills.length?<TableWrap><table className="data-table"><thead><tr><th>종목 / 시각</th><th>구분</th><th className="number">{tab==='fills'?'체결 가격':'현금 변동'}</th><th className="number">{tab==='fills'?'체결 수량':'주식 변동'}</th><th>{tab==='fills'?'체결 번호':'변동 사유'}</th><th>관련 주문</th></tr></thead><tbody>{visibleFills.map(f=><tr key={f.id}><td><StockIdentity stock={stockByCode(f.order.code)} compact/><small className="cell-sub">{f.time}</small></td><td><span className={`side-text ${f.order.side}`}>{f.order.side==='buy'?'매수':'매도'}</span></td><td className="number">{tab==='fills'?money(f.price):`${f.order.side==='buy'?'-':'+'}${money(f.price*f.quantity)}`}원</td><td className="number">{tab==='assets'&&(f.order.side==='buy'?'+':'-')}{f.quantity}주</td><td className="dim mono">{tab==='fills'?f.id:'체결 반영'}</td><td><button className="link-button mono" onClick={()=>setDetailId(f.order.id)}>{f.order.id}</button></td></tr>)}</tbody></table></TableWrap>:<EmptyState title="조건에 맞는 내역이 없어요" description="검색어를 바꾸거나 다른 탭을 선택해 주세요."/>}</>}
    </ViewStateContent><div className="table-footer"><span>목 데이터 · {tab==='orders'?filtered.length:visibleFills.length}건</span><span>기간 조회와 페이지 나누기는 후속 화면에서 확장할 수 있어요.</span></div></Panel>
    <p className="footnote">자산 변동 탭은 체결별 현금·주식 증감을 보여주는 예시입니다. 전체 계좌 원장을 구현한 화면은 아닙니다.</p>
  </>;
}
