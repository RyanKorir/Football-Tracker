"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import {COMPS,GROUPED,Comp} from "@/lib/comps";
import type {Match,Group,Row} from "@/lib/types";
import Scorers from "./Scorers";
import TreeView from "./Tree";

/* ---------- highlights (country-aware) ---------- */
interface Vid{id:string;date:string;home:string;away:string;title:string;src:string}
const HL=createContext<{find:(m:Match)=>Vid|undefined;play:(v:Vid)=>void}>({find:()=>undefined,play:()=>{}});
function Player({v,close}:{v:Vid;close:()=>void}){
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={close}>
    <div className="w-full max-w-3xl" onClick={e=>e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="truncate">{v.title}</span><button onClick={close} className="ghost rounded px-3 py-1">Close ✕</button></div>
      <div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/></div>
      <p className="mt-2 text-xs text-slate-300">Video: {v.src} on YouTube. If it doesn't play in your region, <a className="underline" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">watch it on YouTube</a>.</p>
    </div></div>;
}

/* ---------- helpers ---------- */
type Payload={health:"LIVE"|"CACHED"|"SEED";matches:Match[];table:Group[]|null;at:number|null;error?:string};
const fmt=(iso?:string)=>iso?new Date(iso).toLocaleString(undefined,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZoneName:"short"}):"Time TBC";
const ago=(t:number|null)=>{if(!t)return "never";const s=Math.round((Date.now()-t)/1000);return s<60?`${s}s ago`:`${Math.round(s/60)} min ago`};
const isLive=(m:Match)=>m.status==="LIVE"||m.status==="HALF_TIME";
const human=(s?:string)=>!s?"Matches":s.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()).replace("Quarterfinals","Quarter-finals").replace("Semifinals","Semi-finals").replace("Playoffs","Play-offs").replace("Round Of","Round of");
const ZC:Record<string,string>={g:"#22c55e",b:"#38bdf8",t:"#a78bfa",a:"#f59e0b",r:"#ef4444",n:"transparent"};
// The data provider labels each table position ("Champions League", "Relegation playoff"...). Colour them by meaning.
function relevant(desc:string,letter?:string){
  if(!letter||!desc.includes(":"))return desc;
  for(const seg of desc.split(";")){
    const m=seg.trim().match(/^([A-D](?:\s*[,-]\s*[A-D])*)\s*:\s*(.+)$/);if(!m)continue;
    const ls=new Set<string>();
    for(const part of m[1].split(",")){const r=part.trim().split("-").map(x=>x.trim());if(r.length===2){for(let c=r[0].charCodeAt(0);c<=r[1].charCodeAt(0);c++)ls.add(String.fromCharCode(c))}else ls.add(r[0])}
    if(ls.has(letter))return m[2];
  }
  return desc;
}
const zoneOf=(d:string)=>!d?"n":/play-?off/i.test(d)?"a":/relegat|eliminat/i.test(d)?"r":/conference|qualifying/i.test(d)?"t":/europa/i.test(d)?"b":/champions league|round of 16|qualifies|promotion/i.test(d)?"g":"n";
const Crest=({src}:{src?:string})=>src?<img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-4 w-4 shrink-0 object-contain" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>:<span className="w-4"/>;

function MatchRow({m}:{m:Match}){
  const live=isLive(m),done=m.status==="FULL_TIME",sc=m.hg!==null,{find,play}=useContext(HL),v=done?find(m):undefined;
  const meta=live?`● ${m.minute??"LIVE"}`:done?"FT":m.status==="UPCOMING"?fmt(m.kickoff):m.status.replace("_"," ");
  const btn=v&&<button onClick={()=>play(v)} className="btn rounded px-2 py-0.5 font-semibold">▶ Highlights</button>;
  return <div className="py-2 text-sm" style={live?{color:"var(--accent)"}:undefined}>
    <div className="flex items-center gap-2">
      <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right"><span className="break-words leading-tight sm:truncate">{m.home}</span><Crest src={m.hl}/></span>
      <span className="num w-14 shrink-0 text-center font-bold">{sc?`${m.hg} – ${m.ag}`:"vs"}</span>
      <span className="flex min-w-0 flex-1 items-center gap-1.5"><Crest src={m.al}/><span className="break-words leading-tight sm:truncate">{m.away}</span></span>
      <span className="muted hidden w-28 shrink-0 text-right text-xs sm:block">{meta}</span>
      <span className="hidden w-24 shrink-0 text-right text-xs sm:block">{btn}</span>
    </div>
    <div className="muted mt-1 flex items-center justify-center gap-3 text-xs sm:hidden"><span>{meta}</span>{btn}</div>
    {m.note&&<div className="muted text-center text-xs">{m.note}</div>}
  </div>;
}
const Sec=({t,children}:{t:string;children:React.ReactNode})=><section className="mt-10"><h2 className="mb-3 text-xl font-bold">{t}</h2>{children}</section>;
const Card=({children}:{children:React.ReactNode})=><div className="card rounded-xl p-4 text-sm">{children}</div>;
const Tab=({on,children,...p}:{on?:boolean;children:React.ReactNode}&React.ButtonHTMLAttributes<HTMLButtonElement>)=><button {...p} className={`pill rounded px-3 py-1 text-sm ${on?"btn font-semibold":"ghost"}`}>{children}</button>;

/* ---------- table ---------- */
function computeTable(ms:Match[]):Group[]{ // fallback when the official table is unavailable: points, goal difference, goals scored
  const t=new Map<string,Row>();
  const get=(n:string)=>{let r=t.get(n);if(!r){r={team:n,pos:0,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,zone:""};t.set(n,r)}return r};
  for(const m of ms.filter(m=>m.status==="FULL_TIME"&&m.hg!==null&&(!m.round||m.round==="league-phase"||/regular|20\d\d/.test(m.round)))){
    const h=get(m.home),a=get(m.away),x=m.hg!,y=m.ag!;h.p++;a.p++;h.gf+=x;h.ga+=y;a.gf+=y;a.ga+=x;
    if(x>y){h.w++;a.l++;h.pts+=3}else if(x<y){a.w++;h.l++;a.pts+=3}else{h.d++;a.d++;h.pts++;a.pts++}
  }
  const rows=[...t.values()].map(r=>({...r,gd:r.gf-r.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.team.localeCompare(b.team)).map((r,i)=>({...r,pos:i+1}));
  return rows.length?[{name:"Table (calculated)",rows}]:[];
}
function formMap(ms:Match[]){
  const f=new Map<string,string[]>();
  for(const m of ms.filter(m=>m.status==="FULL_TIME"&&m.hg!==null)){
    const x=m.hg!,y=m.ag!,add=(n:string,r:string)=>f.set(n,[...(f.get(n)??[]),r]);
    add(m.home,x>y?"W":x<y?"L":"D");add(m.away,y>x?"W":y<x?"L":"D");
  }
  return f;
}
const FCOL:Record<string,string>={W:"#22c55e",D:"#64748b",L:"#ef4444"};
function Table({comp,groups,ms}:{comp:Comp;groups:Group[];ms:Match[]}){
  const [lg,setLg]=useState("A"),multi=groups.length>1,form=useMemo(()=>formMap(ms),[ms]);
  const shown=multi?groups.filter(g=>g.name.replace("Group ","").startsWith(lg)):groups;
  const legend=new Map<string,string>();
  const cards=shown.map(g=>{
    const letter=multi?g.name.replace("Group ","")[0]:undefined;
    return <div key={g.name} className="card overflow-x-auto rounded-xl p-3">
      {multi&&<div className="acc mb-1 text-sm font-semibold">{g.name}</div>}
      <table className={`num w-full text-sm ${multi?"min-w-[340px]":"sm:min-w-[560px]"}`}>
        <thead className="muted text-xs"><tr><th className="text-left">#</th><th className="text-left">{comp.kind==="groups"?"Team":"Club"}</th>{["P","W","D","L",...(multi?[]:["GF","GA"]),"GD","Pts"].map(h=><th key={h} className={`w-9 ${h==="GF"||h==="GA"?"hidden sm:table-cell":""}`}>{h}</th>)}{!multi&&<th className="hidden pl-3 text-left sm:table-cell">Form</th>}</tr></thead>
        <tbody>{g.rows.map(r=>{const d=relevant(r.zone,letter),z=zoneOf(d);if(d&&z!=="n")legend.set(d,z);
          return <tr key={r.team} className="text-center" style={{borderLeft:`4px solid ${ZC[z]}`}}>
          <td className="pl-2 text-left">{r.pos}</td><td className="py-1 text-left"><span className="inline-flex items-center gap-1.5"><Crest src={r.logo}/>{r.team}</span></td>
          <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>{!multi&&<><td className="hidden sm:table-cell">{r.gf}</td><td className="hidden sm:table-cell">{r.ga}</td></>}<td>{r.gd>0?`+${r.gd}`:r.gd}</td><td className="font-bold">{r.pts}</td>
          {!multi&&<td className="hidden pl-3 text-left sm:table-cell"><span className="inline-flex gap-1">{(form.get(r.team)??[]).slice(-5).map((f,i)=><span key={i} className="inline-block h-4 w-4 rounded text-center text-[10px] leading-4 text-white" style={{background:FCOL[f]}}>{f}</span>)}</span></td>}</tr>})}</tbody></table>
    </div>});
  return <div>
    {multi&&<div className="mb-3 flex gap-2">{["A","B","C","D"].map(l=><Tab key={l} on={lg===l} onClick={()=>setLg(l)}>League {l}</Tab>)}</div>}
    <div className={multi?"grid gap-4 lg:grid-cols-2":""}>{cards}</div>
    <div className="muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">{[...legend].map(([d,z])=><span key={d} className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm" style={{background:ZC[z]}}/>{d}</span>)}<span>Colours show current position, not confirmed outcomes.</span></div>
  </div>;
}

/* ---------- fixtures ---------- */
function Fixtures({comp,ms}:{comp:Comp;ms:Match[]}){
  const [sel,setSel]=useState<string|null>(null);
  const slices=useMemo(()=>{
    const by=new Map<string,{key:string;label:string;first:string;ms:Match[]}>();
    for(const m of ms){
      const mwBased=m.mw!==undefined&&(comp.kind==="league"||comp.kind==="groups"||(comp.kind==="uefa"&&m.round==="league-phase"));
      const key=mwBased?`mw${m.mw}`:`r:${m.round??"all"}`;
      const label=mwBased?(comp.kind==="league"?`Matchweek ${m.mw}`:`${comp.kind==="uefa"?"League phase · ":""}Matchday ${m.mw}`):human(m.round);
      const s=by.get(key)??{key,label,first:m.kickoff??"",ms:[]};s.ms.push(m);if((m.kickoff??"")<s.first)s.first=m.kickoff??"";by.set(key,s);
    }
    return [...by.values()].sort((a,b)=>a.first.localeCompare(b.first));
  },[comp,ms]);
  if(!slices.length)return <Card><span className="muted">No fixtures loaded yet.</span></Card>;
  const cur=slices.find(s=>s.ms.some(m=>m.status==="UPCOMING"||isLive(m)))??slices[slices.length-1];
  const w=slices.find(s=>s.key===sel)??cur,i=slices.indexOf(w);
  const days=new Map<string,Match[]>();
  for(const m of w.ms){const k=m.kickoff?new Date(m.kickoff).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"}):"Date TBC";days.set(k,[...(days.get(k)??[]),m])}
  return <div>
    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <Tab disabled={i<=0} onClick={()=>setSel(slices[i-1].key)}>‹ Prev</Tab>
      <select value={w.key} onChange={e=>setSel(e.target.value)} className="ghost rounded px-2 py-1" style={{color:"var(--text)"}}>{slices.map(s=><option key={s.key} value={s.key} style={{color:"#111"}}>{s.label}{s.key===cur.key?" (current)":""}</option>)}</select>
      <Tab disabled={i>=slices.length-1} onClick={()=>setSel(slices[i+1].key)}>Next ›</Tab>
    </div>
    {[...days].map(([d,g])=><div key={d} className="mb-3"><div className="acc mb-1 text-xs font-semibold uppercase tracking-wide">{d}</div><Card>{g.map(m=><MatchRow key={m.id} m={m}/>)}</Card></div>)}
    {comp.kind==="league"&&<p className="muted text-xs">Matchweeks are derived from each club's match order, so rearranged fixtures may appear in a different week from the official one.</p>}
  </div>;
}

/* ---------- knockout rounds board (cups and UEFA knockouts) ---------- */
function Board({ms}:{ms:Match[]}){
  const rounds=useMemo(()=>{
    const by=new Map<string,{first:string;ms:Match[]}>();
    for(const m of ms){if(!m.round||m.round==="league-phase")continue;const r=by.get(m.round)??{first:m.kickoff??"",ms:[]};r.ms.push(m);if((m.kickoff??"")<r.first)r.first=m.kickoff??"";by.set(m.round,r)}
    return [...by].sort((a,b)=>a[1].first.localeCompare(b[1].first));
  },[ms]);
  if(!rounds.length)return <Card><span className="muted">The knockout rounds appear here once their matches are listed.</span></Card>;
  return <div className="flex gap-4 overflow-x-auto pb-2">{rounds.map(([r,v])=><div key={r} className="w-72 shrink-0"><div className="acc mb-1 text-sm font-semibold">{human(r)} <span className="muted font-normal">({v.ms.length})</span></div>
    <div className="card rounded-xl p-3 text-sm">{v.ms.map(m=><div key={m.id} className="py-1.5" style={{borderTop:"1px solid var(--line)"}}>
      <div className="flex justify-between gap-2"><span className="truncate">{m.home}</span><b className="num">{m.hg??"–"}</b></div>
      <div className="flex justify-between gap-2"><span className="truncate">{m.away}</span><b className="num">{m.ag??"–"}</b></div>
      {m.note&&<div className="muted text-xs">{m.note}</div>}{m.status==="UPCOMING"&&<div className="muted text-xs">{fmt(m.kickoff)}</div>}</div>)}</div></div>)}</div>;
}

/* ---------- one competition ---------- */
function Competition({comp}:{comp:Comp}){
  const [d,setD]=useState<Payload|null>(null),[busy,setBusy]=useState(false),[err,setErr]=useState(false),[,tick]=useState(0),[vids,setVids]=useState<Vid[]>([]),[playing,setPlaying]=useState<Vid|null>(null),[view,setView]=useState(false);
  const load=useCallback(async(manual=false)=>{setBusy(true);try{const r=await fetch(manual?`/api/${comp.id}/matches?t=${Date.now()}`:`/api/${comp.id}/matches`,{cache:"no-store"});if(!r.ok)throw 0;setD(await r.json());setErr(false)}catch{setErr(true)}setBusy(false)},[comp.id]);
  const live=!!d?.matches.some(isLive);
  useEffect(()=>{let on=true;const f=async()=>{try{const r=await fetch(`/api/${comp.id}/highlights`);if(r.ok){const j=await r.json();if(on)setVids(j.videos)}}catch{}};if(comp.feeds.length){f();const t=setInterval(f,300000);return()=>{on=false;clearInterval(t)}}},[comp]);
  useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==="Escape")setPlaying(null)};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[]);
  const find=(m:Match)=>{const k=Date.parse(m.kickoff??"");return vids.find(v=>((v.home===m.home&&v.away===m.away)||(v.home===m.away&&v.away===m.home))&&(isNaN(k)||Math.abs(Date.parse(v.date)-k)<4*864e5))};
  useEffect(()=>{load();},[load]);
  useEffect(()=>{const f=()=>{if(!document.hidden)load(true)};document.addEventListener("visibilitychange",f);return()=>document.removeEventListener("visibilitychange",f)},[load]);
  useEffect(()=>{ // adaptive polling: 15s with live matches, else 30s; paused while the tab is hidden
    const id=setInterval(()=>{if(!document.hidden)load()},live?15000:30000);const t=setInterval(()=>tick(x=>x+1),10000);
    return()=>{clearInterval(id);clearInterval(t)};
  },[live,load]);

  const ms=d?.matches??[],played=ms.filter(m=>m.status==="FULL_TIME").length;
  const groups=useMemo(()=>d?.table??(comp.kind==="league"||comp.kind==="uefa"?computeTable(ms):[]),[d,comp,ms]);
  const health=err&&!d?"ERROR":d?.health??"LOADING";
  const chip:Record<string,[string,string]>={LIVE:["#22c55e",`LIVE DATA · updated ${ago(d?.at??null)}`],CACHED:["#f59e0b",`CACHED · provider unavailable · last update ${ago(d?.at??null)}`],SEED:["#38bdf8","OFFLINE · no live data right now"],ERROR:["#ef4444","DATA ERROR · unable to retrieve data"],LOADING:["#94a3b8","Loading…"]};
  const liveNow=ms.filter(isLive);
  const tableTitle=comp.kind==="uefa"?"League phase table":comp.kind==="groups"?"Group tables":"League table";

  return <HL.Provider value={{find,play:setPlaying}}><main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
    <header className="hero flex flex-wrap items-end justify-between gap-3 rounded-2xl p-5">
      <div><h1 className="text-3xl font-extrabold tracking-tight">{comp.icon} {comp.name.toUpperCase()} <span className="acc">{comp.season}</span></h1><p className="muted">{comp.tag}</p></div>
      <div className="text-right text-sm"><div style={{color:chip[health][0]}}>● {chip[health][1]}</div>{d?.error&&health!=="LIVE"&&<div className="muted max-w-xs text-xs">{d.error}</div>}
        <button onClick={()=>load(true)} disabled={busy} className="ghost mt-1 rounded px-3 py-1 disabled:opacity-50">{busy?"Updating…":"↻ Refresh"}</button></div>
    </header>
    <p className="muted mt-2 text-sm num">Matches played: {played}{comp.total?` / ${comp.total}`:""}{ms.length&&!comp.total?` of ${ms.length} listed`:""}</p>

    {!d&&!err&&<div className="mt-6 grid gap-3 sm:grid-cols-2">{[1,2,3,4].map(i=><div key={i} className="card h-40 animate-pulse rounded-xl"/>)}</div>}
    {err&&!d&&<p className="mt-6 text-rose-300">We couldn't retrieve data. Please try again.</p>}

    {d&&<>
      <Sec t="Live now">{liveNow.length?<Card>{liveNow.map(m=><MatchRow key={m.id} m={m}/>)}</Card>:<Card><span className="muted">No matches in play.</span></Card>}</Sec>
      {comp.kind!=="cup"&&<Sec t={tableTitle}>
        {comp.kind==="groups"&&<div className="mb-3"><Tab on={view} onClick={()=>setView(v=>!v)}>{view?"Hide tree view":"🌳 Show tree view"}</Tab></div>}
        {comp.kind==="groups"&&view?<div className="space-y-8">{["A","B","C","D"].map(l=><div key={l}><h3 className="mb-2 font-semibold">League {l}</h3><TreeView league={l} groups={groups}/></div>)}</div>
          :groups.length?<Table comp={comp} groups={groups} ms={ms}/>:<Card><span className="muted">The table appears once matches have been played.</span></Card>}
      </Sec>}
      <Sec t={comp.kind==="cup"?"Rounds and results":"Fixtures & results"}><Fixtures comp={comp} ms={ms}/></Sec>
      {(comp.kind==="cup"||comp.kind==="uefa")&&<Sec t="Knockout rounds board"><Board ms={ms}/></Sec>}
    </>}

    <Sec t="Top scorers & assisters"><Scorers id={comp.id}/></Sec>
    <Sec t="Rules & season facts"><div className="grid gap-3 md:grid-cols-2">{comp.info.map(i=><Card key={i.t}><b>{i.t}</b><ul className="mt-1 list-disc space-y-1 pl-5">{i.items.map(x=><li key={x}>{x}</li>)}</ul></Card>)}</div></Sec>
    {playing&&<Player v={playing} close={()=>setPlaying(null)}/>}
  </main></HL.Provider>;
}

/* ---------- app shell: competition switcher + theme ---------- */
export default function App(){
  const [cid,setCid]=useState<string|null>(null);
  useEffect(()=>{const q=new URLSearchParams(location.search).get("c")||localStorage.getItem("ft:c");setCid(COMPS.some(c=>c.id===q)?q:"pl")},[]);
  const comp=COMPS.find(c=>c.id===cid);
  useEffect(()=>{if(comp)document.body.style.background=comp.theme["--bg"]},[comp]);
  const pick=(id:string)=>{setCid(id);try{localStorage.setItem("ft:c",id)}catch{}history.replaceState(null,"",`?c=${id}`);window.scrollTo({top:0,behavior:"smooth"})};
  if(!comp)return <div className="theme" style={{background:"#0b0b12"}}/>;
  return <div className="theme" style={comp.theme as React.CSSProperties}>
    <nav className="bar sticky top-0 z-40"><div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-2">
      <span className="acc shrink-0 text-sm font-extrabold tracking-wide">⚽<span className="hidden sm:inline"> FOOTBALL TRACKER</span></span>
      {GROUPED.map(g=><div key={g} className="flex shrink-0 items-center gap-1.5 pl-3" style={{borderLeft:"1px solid var(--line)"}}>
        <span className="muted hidden text-[10px] uppercase tracking-wider lg:inline">{g}</span>
        {COMPS.filter(c=>c.cat===g).map(c=><button key={c.id} onClick={()=>pick(c.id)} className={`pill shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${c.id===comp.id?"btn font-semibold":"ghost"}`}>{c.icon} {c.short}</button>)}
      </div>)}
    </div></nav>
    <Competition key={comp.id} comp={comp}/>
    <footer className="muted mx-auto max-w-6xl px-4 pb-8 text-xs" style={{borderTop:"1px solid var(--line)",paddingTop:16}}>
      Live data: ESPN · Rules and dates: UEFA, Premier League, EFL, LaLiga, Lega Serie A, DFL and LFP publications · Highlights: free official YouTube uploads, shown only where they play in your country. Colour schemes are inspired by each competition's branding. Not affiliated with any league. Data may be delayed; cached data is labelled.
    </footer>
  </div>;
}
