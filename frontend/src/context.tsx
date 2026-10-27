import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { account, holdings, initialOrders, remaining, reservedCash, reservedShares, type Connection, type Order, type Page, type Side, type ViewState } from './mocks/data';

interface MockContextValue {
  orders:Order[]; view:ViewState; setView:(s:ViewState)=>void;
  code:string; setCode:(code:string)=>void;
  subscribed:string[]; watched:string[]; toggleSubscribe:(code:string)=>void; toggleWatch:(code:string)=>void;
  connection:Connection; setConnection:(s:Connection)=>void;
  detailId:string|null; setDetailId:(id:string|null)=>void;
  cancelId:string|null; setCancelId:(id:string|null)=>void;
  toast:string; notify:(s:string)=>void; reset:()=>void;
  navigate:(p:Page)=>void; trade:(code:string)=>void;
  create:(data:{code:string;side:Side;price:number;quantity:number;outcome:'accepted'|'rejected'|'checking'})=>string;
  cancel:()=>void; resolve:(id:string)=>void;
}
const Context=createContext<MockContextValue|null>(null);
export function MockProvider({children}:{children:ReactNode}) {
  const [orders,setOrders]=useState<Order[]>(()=>structuredClone(initialOrders));
  const [view,setView]=useState<ViewState>('normal');const [code,setCode]=useState('005930');
  const [subscribed,setSubscribed]=useState(['005930','000660','035420']);const [watched,setWatched]=useState(['005930','000660','035420','005380']);
  const [connection,setConnection]=useState<Connection>('connected');
  const [detailId,setDetailId]=useState<string|null>(null);const [cancelId,setCancelId]=useState<string|null>(null);
  const [toast,notify]=useState('');const sequence=useRef(13);
  const navigate=(page:Page)=>{window.location.hash=`/${page}`;};
  const trade=(stockCode:string)=>{setCode(stockCode);setView('normal');navigate('trade');};
  const toggleSubscribe=(stockCode:string)=>{const exists=subscribed.includes(stockCode);setSubscribed(prev=>exists?prev.filter(c=>c!==stockCode):[...prev,stockCode]);notify(exists?'시세 구독을 해제했어요.':'시세를 구독했어요. 예시 데이터가 표시됩니다.');};
  const toggleWatch=(stockCode:string)=>{setWatched(prev=>prev.includes(stockCode)?prev.filter(c=>c!==stockCode):[...prev,stockCode]);};
  const create:MockContextValue['create']=data=>{
    const id=`TK-1025-${String(sequence.current++).padStart(4,'0')}`;
    const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
    const order:Order={...data,id,status:data.outcome,filled:0,cancelled:0,time,fills:[]};
    if(data.outcome==='rejected')order.reason='접수 거절 상태를 보여주는 예시입니다. 자산은 예약되지 않아요.';
    if(data.outcome==='checking')order.reason='응답을 받지 못한 예시입니다. 다시 주문하기 전에 기존 결과를 확인해 주세요.';
    setOrders(prev=>[order,...prev]);return id;
  };
  const cancel=()=>{
    setOrders(prev=>prev.map(o=>o.id===cancelId?{...o,cancelled:o.cancelled+remaining(o),status:'cancelled'}:o));
    const id=cancelId;setCancelId(null);setDetailId(id);notify('미체결 잔량이 취소된 화면으로 변경했어요.');
  };
  const resolve=(id:string)=>{
    setOrders(prev=>{
      const target=prev.find(o=>o.id===id);if(!target||target.status!=='checking')return prev;
      const affordable=target.side==='sell'
        ?(holdings.find(h=>h.code===target.code)?.quantity??0)-reservedShares(prev,target.code)>=target.quantity
        :account.cash-reservedCash(prev)>=target.price*target.quantity;
      return prev.map(o=>o.id===id?{...o,status:affordable?'accepted':'rejected',reason:affordable?undefined:'주문 가능 자산이 부족해 접수되지 않았어요.'}:o);
    });notify('기존 요청의 결과를 다시 확인한 예시입니다.');
  };
  const reset=()=>{setOrders(structuredClone(initialOrders));setView('normal');setCode('005930');setSubscribed(['005930','000660','035420']);setWatched(['005930','000660','035420','005380']);setConnection('connected');setDetailId(null);setCancelId(null);sequence.current=13;notify('처음 목 데이터로 되돌렸어요.');};
  return <Context.Provider value={{orders,view,setView,code,setCode,subscribed,watched,toggleSubscribe,toggleWatch,connection,setConnection,detailId,setDetailId,cancelId,setCancelId,toast,notify,reset,navigate,trade,create,cancel,resolve}}>{children}</Context.Provider>;
}
export function useMock(){const value=useContext(Context);if(!value)throw new Error('MockProvider is required');return value;}
