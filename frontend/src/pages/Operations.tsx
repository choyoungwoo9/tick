import { Activity, ArrowUpRight, CheckCircle2, CircleDot, Clock3, Radio, RefreshCw } from 'lucide-react';
import { useMock } from '../context';
import { Badge, Button, Notice, Panel, Stat, TableWrap } from '../components/ui';

export default function Operations(){
  const {navigate,setConnection,orders,setDetailId}=useMock();
  const events=[{time:'14:32:06',title:'시세 상태 확인 완료',detail:'관심종목 3개 · 최신 상태 확인',status:'정상',tone:'green'},
    {time:'14:31:42',title:'주문 접수 확정',detail:'TK-1025-0012 · 삼성전자 10주',status:'정상',tone:'green'},
    {time:'14:29:21',title:'부분 체결 반영',detail:'TK-1025-0011 · 누적 4주 체결',status:'정상',tone:'green'},
    {time:'14:02:18',title:'주문 결과 재확인 필요',detail:'TK-1025-0006 · 접수 응답 미확인',status:'확인 필요',tone:'amber'}];
  return <>
    <div className="page-heading"><div><div className="eyebrow">OPERATIONS</div><h1>운영 현황</h1><p>주문 처리와 시세 전달의 상태를 살펴보는 운영 화면 초안입니다.</p></div><Badge>운영자 미리보기</Badge></div>
    <Notice><strong>샘플 지표입니다.</strong> 아래 숫자는 측정 결과가 아니며, 성능 목표 달성 여부를 나타내지 않아요.</Notice>
    <div className="stats-grid"><Stat label="주문 접수 처리량" value={<>1,324<small>건/초</small></>} sub={<><span className="legend-dot green"/> 샘플 지표</>} icon={<Activity size={16}/>}/><Stat label="접수 지연 P99" value={<>18<small>ms</small></>} sub="샘플 지표 · 최근 5분" icon={<Clock3 size={16}/>}/><Stat label="활성 시세 구독자" value={<>18,420<small>명</small></>} sub="갱신 수신 중인 이용자 예시" icon={<Radio size={16}/>}/><Stat label="시세 전달 지연 P99" value={<>24<small>ms</small></>} sub="샘플 지표 · 최근 5분"/></div>
    <div className="overview-grid"><Panel title="처리 현황" description="집계 항목과 정보 배치를 확인하기 위한 샘플"><div className="operations-status">{[['주문 접수','정상'],['매칭 · 체결 반영','정상'],['시세 전달','정상']].map(([label,status])=><div key={label}><span><CheckCircle2 size={17}/>{label}</span><Badge tone="green">{status}</Badge></div>)}</div><div className="resource-grid">{[['CPU','24%',24],['메모리','41%',41],['네트워크','18%',18]].map(([label,value,percent])=><div key={label}><span>{label}<strong>{value}</strong></span><div className="meter"><i style={{width:`${percent}%`}}/></div></div>)}</div></Panel>
    <Panel title="장애 · 복구 화면" description="이용자가 보게 될 상태를 확인하세요."><div className="scenario-list"><div><span className="scenario-icon"><RefreshCw size={19}/></span><div><strong>시세 재연결</strong><p>정보의 최신 여부와 재연결 안내</p></div><Button size="sm" onClick={()=>{setConnection('recovering');navigate('market');}}>보기<ArrowUpRight size={13}/></Button></div><div><span className="scenario-icon amber"><CircleDot size={19}/></span><div><strong>주문 결과 확인 중</strong><p>미확정 요청의 재확인 안내</p></div><Button size="sm" onClick={()=>{const target=orders.find(o=>o.status==='checking');if(target)setDetailId(target.id);else navigate('orders');}}>보기<ArrowUpRight size={13}/></Button></div></div><div className="operations-note">데이터 보존·복구·무중단 배포는 실제 서비스 연동 후 별도로 검증할 항목입니다.</div></Panel></div>
    <Panel title="최근 처리 기록" actions={<Badge>예시 기록</Badge>}><TableWrap><table className="data-table"><thead><tr><th>시각</th><th>처리 내용</th><th>관련 정보</th><th>상태</th></tr></thead><tbody>{events.map(e=><tr key={e.time}><td className="mono dim">{e.time}</td><td>{e.title}</td><td className="dim">{e.detail}</td><td><Badge tone={e.tone}>{e.status}</Badge></td></tr>)}</tbody></table></TableWrap></Panel>
    <div className="goal-strip"><div><span className="subtle-label">기획서 목표</span><strong>주문 10,000건/초</strong></div><div><span className="subtle-label">기획서 목표</span><strong>동시 시세 구독자 100,000명</strong></div><p>시험 조건·허용 지연·오류율을 합의한 뒤 실제 환경에서 검증합니다.</p></div>
  </>;
}
