import { useState } from 'react';
import { ArrowRight, Check, Plus, Search } from 'lucide-react';
import { useMock } from '../context';
import { statusLabels, type OrderStatus } from '../mocks/data';
import { Badge, Button, EmptyState, Modal, Notice, Panel, Skeleton, StatusBadge, Tabs } from '../components/ui';

export default function Components(){
  const [modal,setModal]=useState(false);const [tab,setTab]=useState('first');const {notify}=useMock();
  return <>
    <div className="page-heading"><div><div className="eyebrow">COMPONENT LIBRARY</div><h1>컴포넌트 모음</h1><p>각 화면에서 사용하는 UI 요소와 상태를 한곳에서 확인하세요.</p></div><Badge>UI 초안 · v0.1</Badge></div>
    <div className="component-grid"><Panel title="버튼" description="기본 · 강조 · 위험 · 비활성"><div className="component-examples"><Button variant="primary" icon={<Plus size={15}/>} onClick={()=>notify('강조 버튼을 눌렀어요.')}>기본 작업</Button><Button onClick={()=>setModal(true)}>확인창 열기</Button><Button variant="danger" onClick={()=>setModal(true)}>잔량 취소</Button><Button variant="ghost" icon={<ArrowRight size={15}/>} onClick={()=>notify('보조 작업 예시입니다.')}>보조 작업</Button><Button disabled>비활성 상태</Button><Button size="sm" onClick={()=>notify('작은 버튼을 눌렀어요.')}>작은 버튼</Button></div></Panel>
    <Panel title="주문 상태" description="접수 결과와 체결 상태를 구분해요."><div className="component-examples">{(Object.keys(statusLabels) as OrderStatus[]).map(s=><StatusBadge key={s} status={s}/>)}</div><p className="component-caption">상태는 색상과 텍스트를 함께 사용해 구분합니다.</p></Panel>
    <Panel title="입력 요소" description="라벨 · 도움말 · 오류 안내"><div className="component-form"><label className="field">검색<input placeholder="종목명 또는 종목코드"/></label><label className="field">주문 방식<select><option>지정가</option></select></label><label className="field">주문 수량<input aria-describedby="sample-field-error" defaultValue="0" aria-invalid="true"/><span className="field-error" id="sample-field-error">1주 이상 입력해 주세요.</span></label></div></Panel>
    <Panel title="탭과 상태 표시"><Tabs items={[{value:'first',label:'주문 내역',count:7},{value:'second',label:'체결 내역',count:4}]} value={tab} onChange={setTab}/><p className="component-caption">선택된 보기: {tab==='first'?'주문 내역':'체결 내역'}</p><div className="component-examples"><Badge tone="green">연결 정상</Badge><Badge tone="amber">재연결 중</Badge><Badge tone="red">시세 지연</Badge><Badge>모의투자</Badge></div></Panel></div>
    <Panel title="안내 메시지"><div className="notice-stack"><Notice>접수가 확정되어도 체결은 별도로 진행돼요.</Notice><Notice tone="warning" action={<Button size="sm" onClick={()=>notify('다시 확인한 예시입니다.')}>다시 확인</Button>}>응답을 확인하지 못했어요. 기존 주문 결과를 확인해 주세요.</Notice><Notice tone="success">최신 시세 상태를 확인했어요.</Notice></div></Panel>
    <div className="component-grid"><Panel title="비어 있는 화면"><EmptyState title="아직 관심종목이 없어요" description="자주 보는 종목을 추가해 보세요." action={<Button icon={<Search size={15}/>} onClick={()=>notify('종목 탐색 버튼 예시입니다.')}>종목 둘러보기</Button>}/></Panel><Panel title="불러오는 중"><Skeleton rows={3}/></Panel></div>
    {modal&&<Modal title="변경 내용을 확인할까요?" description="확인과 취소 동작을 살펴보는 공통 모달입니다." onClose={()=>setModal(false)}><div className="modal-body"><Notice>실제 계좌나 거래에 영향을 주지 않는 화면 예시예요.</Notice></div><div className="modal-footer"><Button onClick={()=>setModal(false)}>돌아가기</Button><Button variant="primary" icon={<Check size={15}/>} onClick={()=>{setModal(false);notify('확인 동작을 완료했어요.');}}>확인</Button></div></Modal>}
  </>;
}
