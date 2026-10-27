import { useEffect, useState } from 'react';
import { ArrowUpRight, Bell, ChevronDown, CircleHelp, Component, Landmark, LayoutDashboard, ListOrdered, Radio, RotateCcw, ShieldCheck, WalletCards } from 'lucide-react';
import { MockProvider, useMock } from './context';
import { BankingProvider, useBanking } from './banking-context';
import { type Page, type ViewState } from './mocks/data';
import { Badge, Toast } from './components/ui';
import { OrderOverlays } from './components/trading';
import Assets from './pages/Assets';
import Trade from './pages/Trade';
import Orders from './pages/Orders';
import Market from './pages/Market';
import Operations from './pages/Operations';
import Components from './pages/Components';
import Accounts from './pages/Accounts';

const nav=[{id:'assets',label:'내 계좌',icon:WalletCards},{id:'accounts',label:'계좌 관리',icon:Landmark},{id:'trade',label:'주문하기',icon:ArrowUpRight},{id:'orders',label:'주문 · 체결',icon:ListOrdered},{id:'market',label:'시세 · 관심종목',icon:Radio},{id:'operations',label:'운영 현황',icon:LayoutDashboard},{id:'components',label:'컴포넌트 모음',icon:Component}] as const;
const pages:Record<Page,()=>React.JSX.Element>={assets:Assets,accounts:Accounts,trade:Trade,orders:Orders,market:Market,operations:Operations,components:Components};
const readPage=():Page=>{const p=window.location.hash.replace('#/','');return nav.some(item=>item.id===p)?p as Page:'assets';};

function Workspace(){
  const [page,setPage]=useState<Page>(readPage);const {navigate,view,setView,reset,toast,notify,orders}=useMock();
  const {resetBanking}=useBanking();
  useEffect(()=>{const update=()=>{setPage(readPage());window.scrollTo(0,0);};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  useEffect(()=>{document.title=`${nav.find(n=>n.id===page)?.label} · TICK`;window.scrollTo(0,0);},[page]);
  const Screen=pages[page];
  return <div className="app-shell"><a className="skip-link" href="#main-content">본문으로 이동</a><aside className="sidebar"><a className="brand" href="#/assets" aria-label="TICK 내 계좌"><span className="brand-symbol"><i/><i/><i/></span>TICK<span className="brand-caption">모의투자</span></a><div className="workspace-label">WORKSPACE</div><nav aria-label="주 메뉴">{nav.map(item=><a key={item.id} href={`#/${item.id}`} className={`${page===item.id?'active':''} ${item.id==='operations'?'nav-divider':''}`} aria-current={page===item.id?'page':undefined}><item.icon size={19} strokeWidth={1.7}/><span>{item.label}</span>{item.id==='orders'&&<span className="nav-count">{orders.filter(o=>['accepted','pending','partial'].includes(o.status)).length}</span>}</a>)}</nav><div className="sidebar-bottom"><div className="prototype-card"><span className="status-dot"/><strong>프론트엔드 목</strong><p>예시 데이터로 화면과 흐름을 확인하는 공간이에요.</p></div><button className="profile" onClick={()=>notify('로그인·계좌 전환은 후속 연동 범위입니다.')}><span className="profile-avatar">T</span><span><strong>김틱</strong><small>개인 모의계좌</small></span><ChevronDown size={15}/></button></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb">나의 워크스페이스<span>/</span><strong>{nav.find(n=>n.id===page)?.label}</strong></div><div className="topbar-actions"><Badge tone="green"><ShieldCheck size={12}/>모의투자</Badge><button className="icon-button" aria-label="목 화면 안내" onClick={()=>notify('모든 데이터는 예시이며, 새로고침하면 초기화됩니다.')}><CircleHelp size={18}/></button><button className="icon-button" aria-label="알림 확인" onClick={()=>notify('새로운 알림이 없어요.')}><Bell size={18}/></button><span className="top-avatar">T</span></div></header>
    <div className="preview-toolbar"><span><span className="preview-dot"/>화면 초안 <small>· 예시 데이터 / 실제 거래 없음</small></span><div>{['assets','orders','market'].includes(page)&&<label>목 화면 상태<select value={view} aria-label="목 화면 상태" onChange={e=>setView(e.target.value as ViewState)}><option value="normal">기본</option><option value="empty">빈 화면</option><option value="loading">불러오는 중</option><option value="error">오류</option></select></label>}<button onClick={()=>{resetBanking();reset();}}><RotateCcw size={13}/>초기화</button></div></div>
    <main id="main-content" className="main-content"><Screen/><footer className="app-footer"><span>TICK · 화면 초안 v0.1</span><button onClick={()=>navigate('components')}>UI 컴포넌트 보기 <ArrowUpRight size={12}/></button><span>MOCK WORKSPACE</span></footer></main></div>
    <OrderOverlays/>{toast&&<Toast message={toast} onClose={()=>notify('')}/>}</div>;
}
export default function App(){return <MockProvider><BankingProvider><Workspace/></BankingProvider></MockProvider>;}
