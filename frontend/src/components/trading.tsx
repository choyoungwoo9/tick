import { CheckCircle2, Clock3, FileCheck2 } from 'lucide-react';
import { useMock } from '../context';
import { canCancel, money, remaining, sampleTime, stockByCode, type Order } from '../mocks/data';
import { Badge, Button, EmptyState, Modal, Notice, StatusBadge, StockIdentity, TableWrap } from './ui';

export function OrdersTable({orders,compact=false}:{orders:Order[];compact?:boolean}) {
  const {setDetailId,setCancelId}=useMock();
  if(!orders.length)return <EmptyState title="조건에 맞는 주문이 없어요" description="다른 상태를 선택하거나 새로운 주문을 확인해 주세요."/>;
  return <TableWrap><table className="data-table"><thead><tr><th>종목 / 주문 시각</th><th>구분</th><th className="number">주문 가격</th><th className="number">주문 / 체결</th><th>상태</th>{!compact&&<th className="number">미체결</th>}<th><span className="sr-only">주문 작업</span></th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><button className="stock-button" onClick={()=>setDetailId(order.id)}><StockIdentity stock={stockByCode(order.code)} compact/><small>{order.time}</small></button></td><td><span className={`side-text ${order.side}`}>{order.side==='buy'?'매수':'매도'}</span></td><td className="number">{money(order.price)}<span className="unit">원</span></td><td className="number">{order.quantity}<span className="dim"> / {order.filled}주</span></td><td><StatusBadge status={order.status}/></td>{!compact&&<td className="number">{['rejected','checking'].includes(order.status)?'—':`${remaining(order)}주`}</td>}<td className="row-actions"><Button size="sm" variant="ghost" onClick={()=>setDetailId(order.id)}>상세</Button>{!compact&&canCancel(order)&&<Button size="sm" onClick={()=>setCancelId(order.id)}>취소</Button>}</td></tr>)}</tbody></table></TableWrap>;
}

export function OrderOverlays(){
  const {orders,detailId,setDetailId,cancelId,setCancelId,cancel,resolve}=useMock();
  const selected=orders.find(o=>o.id===detailId);const target=orders.find(o=>o.id===cancelId);
  return <>{selected&&!target&&<Modal drawer title="주문 상세" description={selected.id} onClose={()=>setDetailId(null)}>
    <div className="drawer-body"><div className="detail-stock"><StockIdentity stock={stockByCode(selected.code)}/><StatusBadge status={selected.status}/></div>
    {selected.status==='checking'&&<Notice tone="warning">아직 접수 여부를 확인하지 못했어요. 같은 주문을 새로 제출하기 전에 결과를 확인해 주세요.</Notice>}
    {selected.status==='rejected'&&<Notice tone="warning">{selected.reason}</Notice>}
    <dl className="detail-list"><div><dt>주문 구분</dt><dd className={`side-text ${selected.side}`}>지정가 {selected.side==='buy'?'매수':'매도'}</dd></div><div><dt>주문 가격</dt><dd>{money(selected.price)}원</dd></div><div><dt>주문 시각</dt><dd>2026.10.25 {selected.time}</dd></div><div><dt>계좌</dt><dd>TICK 1000-0001</dd></div></dl>
    <h3 className="subheading">수량 현황</h3><div className="quantity-grid">{[['주문',selected.quantity],['체결',selected.filled],['취소',selected.cancelled],['미체결',['checking','rejected'].includes(selected.status)?'—':remaining(selected)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}<small>{value==='—'?'':'주'}</small></strong></div>)}</div>
    {!['rejected','checking'].includes(selected.status)&&<p className="helper-text">주문 {selected.quantity} = 체결 {selected.filled} + 취소 {selected.cancelled} + 미체결 {remaining(selected)}</p>}
    <h3 className="subheading">체결 내역 <span className="count">{selected.fills.length}</span></h3>
    {selected.fills.length?<div className="fill-list">{selected.fills.map(fill=><div key={fill.id}><span className="timeline-icon"><CheckCircle2 size={16}/></span><div><strong>{money(fill.price)}원 · {fill.quantity}주</strong><small>{fill.time} · {fill.id}</small></div><Badge tone="green">반영 완료</Badge></div>)}</div>:<div className="quiet-empty"><Clock3 size={18}/><span>아직 체결된 내역이 없어요.</span></div>}
    <div className="detail-note"><FileCheck2 size={17}/><div><strong>접수와 체결은 달라요</strong><p>주문이 접수되어도 조건에 맞는 상대 주문이 있어야 체결돼요. 취소된 주문도 기존 체결 내역은 유지돼요.</p></div></div>
    <p className="helper-text">{sampleTime} 기준 예시 · 화면 데이터는 새로고침하면 초기화됩니다.</p>
    </div><div className="modal-footer">{selected.status==='checking'?<Button variant="primary" onClick={()=>resolve(selected.id)}>기존 주문 결과 확인</Button>:canCancel(selected)?<Button variant="danger" onClick={()=>setCancelId(selected.id)}>미체결 {remaining(selected)}주 취소</Button>:<Button onClick={()=>setDetailId(null)}>닫기</Button>}</div>
  </Modal>}
  {target&&<Modal title="미체결 잔량을 취소할까요?" description="취소가 확정된 수량은 더 이상 체결되지 않아요." onClose={()=>setCancelId(null)}><div className="modal-body"><StockIdentity stock={stockByCode(target.code)}/><dl className="detail-list"><div><dt>이미 체결된 수량</dt><dd>{target.filled}주</dd></div><div><dt>취소 요청 수량</dt><dd>{remaining(target)}주</dd></div></dl><Notice>이미 체결된 {target.filled}주는 유지돼요. 이 초안에서는 취소 확정 예시를 바로 보여드려요.</Notice></div><div className="modal-footer"><Button onClick={()=>setCancelId(null)}>돌아가기</Button><Button variant="danger" onClick={cancel}>잔량 취소 확인</Button></div></Modal>}
  </>;
}
