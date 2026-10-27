import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight, Inbox, Info, LoaderCircle, Search, TriangleAlert, X } from 'lucide-react';
import { statusLabels, type OrderStatus, type Stock, type ViewState } from '../mocks/data';

export function Button({ variant='secondary', size, icon, children, className='', ...props }:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost'|'danger';size?:'sm';icon?:ReactNode}) {
  return <button className={`button ${variant} ${size==='sm'?'small':''} ${className}`} {...props}>{icon}{children}</button>;
}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}) { return <span className={`badge ${tone}`}>{children}</span>; }
export function StatusBadge({status}:{status:OrderStatus}) {
  const tone={accepted:'green',pending:'neutral',partial:'amber',filled:'green',cancelled:'neutral',rejected:'red',checking:'amber'}[status];
  return <Badge tone={tone}>{status==='checking'&&<span className="status-dot"/>}{statusLabels[status]}</Badge>;
}
export function Panel({title,description,actions,children,className=''}:{title?:string;description?:string;actions?:ReactNode;children:ReactNode;className?:string}) {
  return <section className={`panel ${className}`}>{(title||actions)&&<div className="panel-heading"><div>{title&&<h2>{title}</h2>}{description&&<p>{description}</p>}</div>{actions&&<div className="panel-actions">{actions}</div>}</div>}{children}</section>;
}
export function Tabs({items,value,onChange,label='보기 선택'}:{items:{value:string;label:string;count?:number}[];value:string;onChange:(v:string)=>void;label?:string}) {
  return <div className="tabs" role="group" aria-label={label}>{items.map(item=><button key={item.value} type="button" aria-pressed={value===item.value} className={value===item.value?'selected':''} onClick={()=>onChange(item.value)}>{item.label}{item.count!==undefined&&<span>{item.count}</span>}</button>)}</div>;
}
export function SearchField({value,onChange,placeholder='종목명 또는 종목코드 검색'}:{value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return <label className="search-field"><Search size={16}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>{value&&<button type="button" aria-label="검색 지우기" onClick={()=>onChange('')}><X size={14}/></button>}</label>;
}
export function StockIdentity({stock,compact=false}:{stock:Stock;compact?:boolean}) {
  return <span className="stock-identity"><span className={`stock-avatar ${stock.color}`}>{stock.short}</span><span><strong>{stock.name}</strong>{!compact&&<small>{stock.code}</small>}</span></span>;
}
export function Change({value,children}:{value:number;children?:ReactNode}) {
  return <span className={`change ${value>=0?'up':'down'}`}>{value>=0?<ArrowUpRight size={13}/>:<ArrowDownLeft size={13}/>} {children??`${Math.abs(value).toFixed(2)}%`}</span>;
}
export function Stat({label,value,sub,icon}:{label:string;value:ReactNode;sub?:ReactNode;icon?:ReactNode}) {
  return <div className="stat-card"><div className="stat-label">{label}{icon}</div><div className="stat-value">{value}</div>{sub&&<div className="stat-sub">{sub}</div>}</div>;
}
export function Notice({children,tone='info',action}:{children:ReactNode;tone?:'info'|'warning'|'success';action?:ReactNode}) {
  return <div className={`notice ${tone}`} role={tone==='warning'?'status':undefined}>{tone==='warning'?<TriangleAlert size={17}/>:tone==='success'?<Check size={17}/>:<Info size={17}/>}<div>{children}</div>{action&&<div className="notice-action">{action}</div>}</div>;
}
export function EmptyState({title='아직 내역이 없어요',description='새로운 내역이 생기면 이곳에서 확인할 수 있어요.',action}:{title?:string;description?:string;action?:ReactNode}) {
  return <div className="empty-state"><span className="empty-icon"><Inbox size={24} strokeWidth={1.5}/></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function Skeleton({rows=4}:{rows?:number}) {
  return <div className="skeleton-wrap" aria-label="불러오는 중" role="status">{Array.from({length:rows},(_,i)=><div className="skeleton-row" key={i}><span className="skeleton skeleton-avatar"/><span className="skeleton skeleton-text"/><span className="skeleton skeleton-number"/></div>)}</div>;
}
export function ViewStateContent({state,children,onRetry,emptyAction}:{state:ViewState;children:ReactNode;onRetry:()=>void;emptyAction?:ReactNode}) {
  if(state==='loading')return <Skeleton/>;
  if(state==='empty')return <EmptyState action={emptyAction}/>;
  if(state==='error')return <div className="empty-state"><span className="empty-icon error"><TriangleAlert size={23}/></span><h3>정보를 불러오지 못했어요</h3><p>잠시 후 다시 시도해 주세요.</p><Button onClick={onRetry}>다시 불러오기</Button></div>;
  return <>{children}</>;
}
export function TableWrap({children}:{children:ReactNode}) { return <div className="table-scroll">{children}</div>; }
export function TextLink({children,onClick}:{children:ReactNode;onClick:()=>void}) { return <button className="text-link" type="button" onClick={onClick}>{children}<ChevronRight size={14}/></button>; }
export function Modal({title,description,children,onClose,drawer=false}:{title:string;description?:string;children:ReactNode;onClose:()=>void;drawer?:boolean}) {
  const titleId=useId();const descriptionId=useId();const ref=useRef<HTMLDivElement>(null);const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;
    const background=document.querySelector<HTMLElement>('.app-shell');const wasInert=background?.hasAttribute('inert');
    background?.setAttribute('inert','');document.body.style.overflow='hidden';ref.current?.focus();
    const handle=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();closeRef.current();}
      if(e.key==='Tab'){
        const elements=[...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')??[])];
        const first=elements[0],last=elements[elements.length-1];
        if(!first){e.preventDefault();return;}
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',handle);return()=>{document.removeEventListener('keydown',handle);document.body.style.overflow=overflow;if(!wasInert)background?.removeAttribute('inert');if(previous?.isConnected)previous.focus();};
  },[]);
  return createPortal(<div className={`overlay ${drawer?'drawer-overlay':''}`} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div ref={ref} className={drawer?'drawer':'modal'} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description?descriptionId:undefined} tabIndex={-1}><div className="modal-header"><div><h2 id={titleId}>{title}</h2>{description&&<p id={descriptionId}>{description}</p>}</div><button className="icon-button" aria-label="닫기" onClick={onClose}><X size={20}/></button></div>{children}</div></div>,document.body);
}
export function Toast({message,onClose}:{message:string;onClose:()=>void}) {
  const close=useRef(onClose);close.current=onClose;
  useEffect(()=>{const id=window.setTimeout(()=>close.current(),4200);return()=>window.clearTimeout(id);},[message]);
  return <div className="toast" role="status"><Check size={17}/><span>{message}</span><button aria-label="알림 닫기" onClick={onClose}><X size={15}/></button></div>;
}
export function InlineLoading(){return <span className="inline-loading"><LoaderCircle className="spin" size={14}/>확인 중</span>;}
