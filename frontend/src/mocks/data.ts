export type Page = 'assets' | 'accounts' | 'trade' | 'orders' | 'market' | 'operations' | 'components';
export type ViewState = 'normal' | 'empty' | 'loading' | 'error';
export type Connection = 'connected' | 'recovering' | 'stale';
export type Side = 'buy' | 'sell';
export type OrderStatus = 'accepted' | 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected' | 'checking';

export interface Stock {
  code: string; name: string; short: string; price: number; change: number;
  volume: string; color: string; series: number[];
}
export interface Holding { code: string; quantity: number; average: number }
export interface Fill { id: string; time: string; quantity: number; price: number }
export interface Order {
  id: string; code: string; side: Side; price: number; quantity: number;
  filled: number; cancelled: number; status: OrderStatus; time: string;
  fills: Fill[]; reason?: string;
}

export const account = { name: '나의 첫 모의투자', number: 'TICK 1000-0001', cash: 10_000_000 };
export const sampleTime = '2026.10.25 14:32:06';
export const stocks: Stock[] = [
  { code:'005930',name:'삼성전자',short:'삼',price:72600,change:1.82,volume:'1,284만',color:'blue',series:[36,40,38,44,42,51,48,50,56,53,65,59,68,64,77,73,82,79,88] },
  { code:'000660',name:'SK하이닉스',short:'SK',price:195000,change:2.10,volume:'486만',color:'orange',series:[30,42,38,50,47,55,50,60,58,67,60,73,69,77,80,75,88] },
  { code:'035420',name:'NAVER',short:'N',price:175000,change:-0.85,volume:'92만',color:'green',series:[80,74,77,68,72,62,65,58,63,50,57,43,47,40,44,33] },
  { code:'005380',name:'현대차',short:'H',price:250000,change:0.60,volume:'138만',color:'navy',series:[45,43,49,48,52,47,59,56,60,57,64,62,68,64,70] },
  { code:'035720',name:'카카오',short:'K',price:42300,change:-1.28,volume:'207만',color:'yellow',series:[80,77,65,71,62,58,61,50,57,48,51,40,43,35] },
  { code:'051910',name:'LG화학',short:'LG',price:318000,change:0.95,volume:'58만',color:'purple',series:[40,46,42,50,47,58,52,63,59,66,63,75,69,80] },
  { code:'000270',name:'기아',short:'기',price:98200,change:1.14,volume:'164만',color:'red',series:[42,47,44,55,53,58,55,65,61,70,66,78,75,83] },
  { code:'068270',name:'셀트리온',short:'C',price:182500,change:-0.44,volume:'73만',color:'teal',series:[70,66,71,63,60,66,59,55,60,53,58,50,54,47] },
];
export const holdings: Holding[] = [
  {code:'005930',quantity:80,average:70000},
  {code:'000660',quantity:30,average:188000},
  {code:'035420',quantity:10,average:180000},
  {code:'005380',quantity:5,average:242000},
];
export const initialOrders: Order[] = [
  {id:'TK-1025-0012',code:'005930',side:'buy',price:72600,quantity:10,filled:0,cancelled:0,status:'pending',time:'14:31:42',fills:[]},
  {id:'TK-1025-0011',code:'000660',side:'buy',price:195000,quantity:5,filled:4,cancelled:0,status:'partial',time:'14:29:18',fills:[{id:'EX-0042',time:'14:29:19',quantity:2,price:195000},{id:'EX-0043',time:'14:29:21',quantity:2,price:195000}]},
  {id:'TK-1025-0010',code:'035420',side:'sell',price:175000,quantity:10,filled:4,cancelled:0,status:'partial',time:'14:24:05',fills:[{id:'EX-0038',time:'14:24:06',quantity:4,price:175000}]},
  {id:'TK-1025-0009',code:'005930',side:'buy',price:72000,quantity:8,filled:8,cancelled:0,status:'filled',time:'14:18:32',fills:[{id:'EX-0032',time:'14:18:33',quantity:8,price:72000}]},
  {id:'TK-1025-0008',code:'005380',side:'sell',price:251000,quantity:2,filled:0,cancelled:2,status:'cancelled',time:'14:12:10',fills:[]},
  {id:'TK-1025-0007',code:'005930',side:'buy',price:72600,quantity:1000,filled:0,cancelled:0,status:'rejected',time:'14:08:26',fills:[],reason:'주문 가능 금액이 부족해 접수되지 않았어요.'},
  {id:'TK-1025-0006',code:'035720',side:'buy',price:42300,quantity:1,filled:0,cancelled:0,status:'checking',time:'14:02:18',fills:[],reason:'접수 응답을 확인하지 못했어요. 주문 결과를 다시 확인해 주세요.'},
];

export const statusLabels: Record<OrderStatus,string> = {
  accepted:'접수 확정',pending:'미체결 대기',partial:'부분 체결',filled:'전량 체결',
  cancelled:'취소 확정',rejected:'접수 거절',checking:'결과 확인 중',
};
export const stockByCode = (code:string) => stocks.find(s=>s.code===code)!;
export const money = (value:number) => new Intl.NumberFormat('ko-KR').format(value);
export const remaining = (order:Order) => ['rejected','checking'].includes(order.status) ? 0 : order.quantity-order.filled-order.cancelled;
export const canCancel = (order:Order) => ['accepted','pending','partial'].includes(order.status) && remaining(order)>0;
export const reservedCash = (orders:Order[]) => orders.filter(o=>o.side==='buy').reduce((sum,o)=>sum+remaining(o)*o.price,0);
export const reservedShares = (orders:Order[],code:string) => orders.filter(o=>o.side==='sell'&&o.code===code).reduce((sum,o)=>sum+remaining(o),0);
