"use client";
import type {Group} from "@/lib/types";
// Nations League tree view: groups → outcomes (and for League A all the way to the final). Lines show stages only; nothing is predicted.
type N={t:string;s?:string[]};
const W=170,G=64,NH=92;
function Tree({cols,all}:{cols:N[][];all:number[]}){
  const H=Math.max(...cols.map(c=>c.length))*100,ys=(n:number,j:number)=>(j+0.5)*H/n,x=(i:number)=>i*(W+G),lines:string[]=[];
  cols.slice(0,-1).forEach((c,i)=>{
    const a=c.length,b=cols[i+1].length;
    c.forEach((_,j)=>cols[i+1].forEach((__,k)=>{
      const ok=all.includes(i)||(a===b?j===k:a>b?Math.floor(j*b/a)===k:Math.floor(k*a/b)===j);
      if(ok){const x1=x(i)+W,x2=x(i+1),y1=ys(a,j),y2=ys(b,k);lines.push(`M${x1} ${y1}C${x1+30} ${y1} ${x2-30} ${y2} ${x2} ${y2}`)}
    }));
  });
  const total=cols.length*(W+G)-G;
  return <div className="overflow-x-auto pb-2"><div className="relative" style={{width:total,height:H}}>
    <svg className="absolute inset-0" width={total} height={H}>{lines.map((d,i)=><path key={i} d={d} fill="none" stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1.5}/>)}</svg>
    {cols.map((c,i)=>c.map((n,j)=><div key={`${i}-${j}`} className="card absolute overflow-hidden rounded-lg p-2 text-xs" style={{left:x(i),top:ys(c.length,j)-NH/2,width:W,height:NH}}>
      <div className="acc font-bold">{n.t}</div>{n.s?.map(s=><div key={s} className="truncate">{s}</div>)}</div>))}
  </div></div>;
}
export default function TreeView({league,groups}:{league:string;groups:Group[]}){
  const gs:N[]=groups.filter(g=>g.name.replace("Group ","").startsWith(league)).map(g=>({t:g.name,s:g.rows.map(r=>`${r.pos}. ${r.team} (${r.pts})`)}));
  if(!gs.length)return null;
  let cols:N[][],all:number[]=[0];
  if(league==="A"){all=[];cols=[gs,[{t:"League phase ends",s:["Quarter-final draw"]}],
    [1,2,3,4].map(i=>({t:`QF${i}`,s:["DRAW PENDING","Two legs, aggregate"]})),
    [{t:"SF1",s:["Single match"]},{t:"SF2",s:["Single match"]}],
    [{t:"FINAL",s:["TBD vs TBD","+ Third-place match"]}],[{t:"CHAMPION",s:["TBD"]}]]}
  else if(league==="B")cols=[gs,[{t:"Winners",s:["Promoted to League A"]},{t:"Runners-up",s:["A/B play-off","vs A's 3rd/4th"]},{t:"3rd place",s:["Stay in League B"]},{t:"4th place",s:["B/C play-off","vs C runners-up"]}]];
  else if(league==="C")cols=[gs,[{t:"Winners",s:["Promoted to League B"]},{t:"Runners-up",s:["B/C play-off","vs B's 4th place"]},{t:"3rd & 4th",s:["Stay in League C"]}]];
  else cols=[gs,[{t:"All teams",s:["Promoted to League C"]}]];
  return <>
    <Tree cols={cols} all={all}/>
    {league==="A"&&<p className="muted mt-1 text-xs">Lines show the stages only. Pairings are set by UEFA's draw after the league phase; nothing is predicted. Group boxes show live positions and points.</p>}
  </>;
}
