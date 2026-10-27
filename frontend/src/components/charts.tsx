import { useId } from 'react';
export function Sparkline({series,negative=false,large=false}:{series:number[];negative?:boolean;large?:boolean}) {
  const id=useId().replaceAll(':','');const width=large?760:120,height=large?200:36;
  const max=Math.max(...series),min=Math.min(...series),range=max-min||1;
  const points=series.map((v,i)=>[i/(series.length-1)*width,height-12-(v-min)/range*(height-24)]);
  const path=points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ');
  const color=large?'#21836a':negative?'#4383c6':'#de6a68';
  return <svg className={large?'price-chart':'sparkline'} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="예시 가격 추이" preserveAspectRatio="none"><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".13"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>{large&&[.2,.5,.8].map(n=><line key={n} x1="0" y1={height*n} x2={width} y2={height*n} stroke="#edf0f2" strokeDasharray="4 5"/>)}{large&&<path d={`${path} L${width},${height} L0,${height}Z`} fill={`url(#${id})`}/>}<path d={path} fill="none" stroke={color} strokeWidth={large?2.6:1.8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}
