import type {Comp} from "./comps";
import type {Match,Status,Row,Group} from "./types";
// Unofficial ESPN endpoints (no SLA). Matches are fetched one day at a time; days that are fully finished are never refetched.
const BASE="https://site.api.espn.com/apis/site/v2/sports/soccer/";
const day=864e5,ymd=(t:number)=>new Date(t).toISOString().slice(0,10).replace(/-/g,"");
interface Store{ev:Map<string,any>;done:Set<string>}
const stores=new Map<string,Store>();
const store=(id:string)=>{let s=stores.get(id);if(!s){s={ev:new Map(),done:new Set()};stores.set(id,s)}return s};
export const eventsOf=(id:string):any[]=>[...(stores.get(id)?.ev.values()??[])];

async function fetchDay(slug:string,d:string):Promise<any[]>{
  const r=await fetch(`${BASE}${slug}/scoreboard?dates=${d}`,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(8000),cache:"no-store"});
  if(!r.ok)throw new Error(`${d}: HTTP ${r.status}`);
  const j=await r.json();
  if(!Array.isArray(j.events))throw new Error(`${d}: unexpected response shape`);
  return j.events;
}
export async function fetchMatches(c:Comp):Promise<Match[]>{
  const s=store(c.id),now=Date.now(),last=Math.min(now+10*day,Date.parse(c.end)),days:string[]=[];
  for(let t=Date.parse(c.start);t<=last;t+=day){const d=ymd(t);if(!s.done.has(d))days.push(d)}
  const res:PromiseSettledResult<any[]>[]=[];
  for(let i=0;i<days.length;i+=12)res.push(...await Promise.allSettled(days.slice(i,i+12).map(d=>fetchDay(c.slug,d))));
  if(days.length&&!res.some(r=>r.status==="fulfilled"))throw new Error((res[0] as PromiseRejectedResult)?.reason?.message??"ESPN unreachable");
  res.forEach((r,i)=>{
    if(r.status!=="fulfilled")return;
    for(const e of r.value)s.ev.set(String(e.id),e);
    const d=days[i],t=Date.UTC(+d.slice(0,4),+d.slice(4,6)-1,+d.slice(6,8));
    if(t<now-2*day&&r.value.every(e=>e.status?.type?.state==="post"))s.done.add(d);
  });
  const out:Match[]=[];
  for(const e of s.ev.values()){
    const comp=e.competitions?.[0],cs=comp?.competitors??[];
    const h=cs.find((x:any)=>x.homeAway==="home"),a=cs.find((x:any)=>x.homeAway==="away");
    if(!h?.team?.displayName||!a?.team?.displayName)continue;
    const t=e.status?.type;let status:Status="UPCOMING";
    if(/POSTPONED/.test(t?.name))status="POSTPONED";else if(/CANCEL/.test(t?.name))status="CANCELLED";else if(/ABANDON/.test(t?.name))status="ABANDONED";
    else if(t?.state==="in")status=t.name==="STATUS_HALFTIME"?"HALF_TIME":"LIVE";
    else if(t?.state==="post")status="FULL_TIME";
    const scored=status==="LIVE"||status==="HALF_TIME"||status==="FULL_TIME";
    out.push({id:String(e.id),home:h.team.displayName,away:a.team.displayName,hg:scored?Number(h.score):null,ag:scored?Number(a.score):null,status,kickoff:e.date,
      minute:status==="LIVE"?e.status?.displayClock:status==="HALF_TIME"?"HT":undefined,round:e.season?.slug,note:comp?.notes?.[0]?.headline,hl:h.team.logo,al:a.team.logo});
  }
  out.sort((a,b)=>(a.kickoff??"").localeCompare(b.kickoff??""));
  // Matchweek / matchday (derived): each team's nth league match by kick-off; a fixture takes the later of its two teams' counts.
  if(c.kind!=="cup"){
    const n=new Map<string,number>();
    for(const m of out){
      if(c.kind==="uefa"&&m.round!=="league-phase")continue;
      const h=(n.get(m.home)??0)+1,a=(n.get(m.away)??0)+1;n.set(m.home,h);n.set(m.away,a);m.mw=Math.max(h,a);
    }
  }
  return out;
}
const stat=(e:any,n:string)=>Number(e.stats?.find((s:any)=>s.name===n)?.value??0);
export async function fetchStandings(c:Comp):Promise<Group[]>{
  if(c.kind==="cup")return [];
  const r=await fetch(`https://site.api.espn.com/apis/v2/sports/soccer/${c.slug}/standings`,{signal:AbortSignal.timeout(8000),cache:"no-store"});
  if(!r.ok)throw new Error("standings HTTP "+r.status);
  const j=await r.json();
  return (j.children??[]).map((ch:any):Group=>({name:String(ch.name??""),rows:(ch.standings?.entries??[]).map((e:any,i:number):Row=>({
    team:e.team?.displayName,logo:e.team?.logos?.[0]?.href,pos:stat(e,"rank")||i+1,p:stat(e,"gamesPlayed"),w:stat(e,"wins"),d:stat(e,"ties"),l:stat(e,"losses"),
    gf:stat(e,"pointsFor"),ga:stat(e,"pointsAgainst"),gd:stat(e,"pointDifferential"),pts:stat(e,"points"),zone:String(e.note?.description??"")})).sort((a:Row,b:Row)=>a.pos-b.pos)})).filter((g:Group)=>g.rows.length);
}
