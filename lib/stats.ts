import type {Comp} from "./comps";
import {eventsOf,fetchMatches} from "./espn";
// Top scorers / assisters from ESPN match reports (key events). Own goals are excluded.
interface Goal{scorer:string;team:string;assist?:string}
const memo=new Map<string,{done:Map<string,Goal[]>;live:Map<string,Goal[]>;out?:any;at:number}>();
function parse(j:any):Goal[]{
  const ks:any[]=j.keyEvents??[],any=ks.some(k=>k.scoringPlay===true),goals:Goal[]=[];
  for(const k of ks){
    const ty=String(k.type?.text??""),tx=String(k.text??"");
    const isGoal=any?k.scoringPlay===true:/^(goal|penalty - scored)/i.test(ty);
    if(!isGoal||/own goal/i.test(ty+" "+tx))continue;
    // penalty-shootout kicks are not goals
    if(/shootout/i.test(ty+" "+tx))continue;
    const scorer=k.participants?.[0]?.athlete?.displayName;if(!scorer)continue;
    const m=tx.match(/Assisted by (.+?)(?:\s+with\b|\s+following\b|\s+from\b|\.|$)/i);
    const assist=m?m[1].trim():(/assist/i.test(tx)?k.participants?.[1]?.athlete?.displayName:undefined);
    goals.push({scorer,team:String(k.team?.displayName??""),assist});
  }
  return goals;
}
const top=(m:Map<string,number>)=>[...m].map(([k,n])=>{const [name,team]=k.split("|");return{name,team,n}}).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name)).slice(0,5);
export async function getStats(c:Comp){
  let M=memo.get(c.id);if(!M){M={done:new Map(),live:new Map(),at:0};memo.set(c.id,M)}
  if(M.out&&Date.now()-M.at<45000)return M.out;
  if(!eventsOf(c.id).length)await fetchMatches(c).catch(()=>{});
  const evs=eventsOf(c.id).filter(e=>["in","post"].includes(e.status?.type?.state));
  const todo=evs.filter(e=>e.status.type.state==="in"||!M!.done.has(String(e.id)));
  for(let i=0;i<todo.length;i+=8)await Promise.allSettled(todo.slice(i,i+8).map(async e=>{
    const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${c.slug}/summary?event=${e.id}`,{signal:AbortSignal.timeout(8000),cache:"no-store"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    (e.status.type.state==="post"?M!.done:M!.live).set(String(e.id),parse(await r.json()));
  }));
  const sc=new Map<string,number>(),as=new Map<string,number>();let used=0;
  for(const e of evs){
    const g=M.done.get(String(e.id))??M.live.get(String(e.id));if(!g)continue;used++;
    for(const x of g){
      const k=`${x.scorer}|${x.team}`;sc.set(k,(sc.get(k)??0)+1);
      if(x.assist){const a=`${x.assist}|${x.team}`;as.set(a,(as.get(a)??0)+1)}
    }
  }
  M.out={scorers:top(sc),assisters:top(as),used,total:evs.length,at:Date.now()};M.at=Date.now();return M.out;
}
