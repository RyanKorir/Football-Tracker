"use client";
import {useEffect,useState} from "react";
type P={name:string;team:string;n:number};
type S={scorers:P[];assisters:P[];used:number;total:number};
function List({title,unit,rows}:{title:string;unit:string;rows:P[]}){
  return <div className="card rounded-xl p-4 text-sm"><h3 className="mb-2 font-semibold">{title}</h3>
    {rows.length?<ol>{rows.map((p,i)=><li key={p.name+p.team} className="flex items-center gap-3 py-1.5" style={{borderTop:i?"1px solid var(--line)":"none"}}>
      <span className="muted w-5 num">{i+1}</span><span className="flex-1 truncate">{p.name} <span className="muted">· {p.team}</span></span>
      <span className="acc num font-bold">{p.n}</span><span className="muted w-12 text-xs">{unit}{p.n===1?"":"s"}</span></li>)}</ol>
      :<p className="muted">No data yet.</p>}</div>;
}
export default function Scorers({id}:{id:string}){
  const [s,setS]=useState<S|null>(null),[err,setErr]=useState(false);
  useEffect(()=>{
    let on=true;const f=async()=>{try{const r=await fetch(`/api/${id}/stats`);if(!r.ok)throw 0;const j=await r.json();if(on){setS(j);setErr(false)}}catch{if(on)setErr(true)}};
    f();const t=setInterval(()=>{if(!document.hidden)f()},60000);return()=>{on=false;clearInterval(t)};
  },[id]);
  return <div>
    {!s&&!err&&<div className="card h-40 animate-pulse rounded-xl"/>}
    {err&&!s&&<p className="text-rose-300">Couldn't load player stats.</p>}
    {s&&<div className="grid gap-4 md:grid-cols-2"><List title="Top scorers" unit="goal" rows={s.scorers}/><List title="Top assisters" unit="assist" rows={s.assisters}/></div>}
    {s&&<p className="muted mt-2 text-xs">Top 5 from ESPN match reports ({s.used} of {s.total} played or live matches). Own goals and shoot-out kicks excluded; ties sorted alphabetically.</p>}
  </div>;
}
