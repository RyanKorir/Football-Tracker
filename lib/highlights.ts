import type {Comp} from "./comps";
import {eventsOf} from "./espn";
// Free, official highlights only: found in the public YouTube RSS feed of licensed publishers and played in YouTube's
// official embedded player. Every video is checked for country availability so visitors only see highlights that play
// where they are. Competitions without a configured feed simply show no highlight buttons.
export interface Vid{id:string;date:string;home:string;away:string;title:string;src:string;countries?:string[]|null;chk?:number}
interface St{known:Map<string,Vid>;at:number;diag:Record<string,string>}
const states=new Map<string,St>(),chanIds=new Map<string,string>();
const dec=(s:string)=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");
const EXTRA:[string,string][]=[["Man City","Manchester City"],["Man Utd","Manchester United"],["Man United","Manchester United"],["Spurs","Tottenham Hotspur"],["Nott'm Forest","Nottingham Forest"]];
function names(id:string):[string,string][]{
  const m=new Map<string,string>();
  for(const e of eventsOf(id))for(const c of e.competitions?.[0]?.competitors??[]){
    const t=c.team;if(!t?.displayName)continue;
    for(const n of [t.displayName,t.shortDisplayName,t.location])if(n&&n.length>2)m.set(n,t.displayName);
  }
  for(const [a,c] of EXTRA)if([...m.values()].includes(c))m.set(a,c);
  return [...m].sort((x,y)=>y[0].length-x[0].length);
}
function teamsIn(title:string,nm:[string,string][]):string[]{
  let t=title.toLowerCase();const hits:[number,string][]=[];
  for(const [a,c] of nm){const i=t.indexOf(a.toLowerCase());if(i>=0){hits.push([i,c]);t=t.slice(0,i)+" ".repeat(a.length)+t.slice(i+a.length)}}
  hits.sort((x,y)=>x[0]-y[0]);
  return [...new Set(hits.map(h=>h[1]))].slice(0,2);
}
async function channelId(handle:string):Promise<string|undefined>{
  if(chanIds.has(handle))return chanIds.get(handle);
  const r=await fetch(`https://www.youtube.com/@${handle}`,{signal:AbortSignal.timeout(8000),cache:"no-store",headers:{"Accept-Language":"en"}});
  const m=(await r.text()).match(/"channelId":"(UC[\w-]{22})"/)||[];
  if(m[1])chanIds.set(handle,m[1]);return m[1];
}
async function avail(v:Vid){
  if(v.chk&&Date.now()-v.chk<216e5)return; // re-check every 6 hours
  try{
    const r=await fetch(`https://www.youtube.com/watch?v=${v.id}`,{signal:AbortSignal.timeout(8000),cache:"no-store",headers:{"Accept-Language":"en"}});
    const h=await r.text();
    if(!h.includes('"playabilityStatus"'))return;
    const c=h.match(/"availableCountries":\[([^\]]*)\]/);
    v.countries=c?c[1].replace(/"/g,"").split(",").filter(Boolean):null;v.chk=Date.now(); // null = no restriction; undefined = unverified (never shown)
  }catch{}
}
export async function getHighlights(c:Comp):Promise<{vids:Vid[];diag:Record<string,string>}>{
  let S=states.get(c.id);if(!S){S={known:new Map(),at:0,diag:{}};states.set(c.id,S)}
  if(c.feeds.length&&Date.now()-S.at>300000){
    S.at=Date.now();const nm=names(c.id);
    await Promise.allSettled(c.feeds.map(async f=>{
      try{
        const id=f.id??(f.handle?await channelId(f.handle):undefined);if(!id)throw new Error("channel not found");
        const url=`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,o={signal:AbortSignal.timeout(8000),cache:"no-store" as const};
        let r=await fetch(url,o);if(!r.ok)r=await fetch(url,{...o,signal:AbortSignal.timeout(8000)});
        if(!r.ok)throw new Error("HTTP "+r.status);
        const xml=await r.text();let n=0;const must=new RegExp(f.must,"i");
        for(const m of xml.matchAll(/<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<published>([^<]+)<\/published>/g)){
          const title=dec(m[2]);
          if(!/highlights/i.test(title)||!must.test(title))continue;
          const t=teamsIn(title,nm);if(t.length<2)continue;
          n++;if(!S!.known.has(m[1]))S!.known.set(m[1],{id:m[1],date:m[3],home:t[0],away:t[1],title,src:f.name});
        }
        S!.diag[f.name]=`ok, ${n} highlight(s) in feed`;
      }catch(e){S!.diag[f.name]="error: "+String((e as Error).message);S!.at=Date.now()-240000} // retry in ~1 minute
    }));
    await Promise.allSettled([...S.known.values()].map(avail));
  }
  return {vids:[...S.known.values()].sort((a,b)=>b.date.localeCompare(a.date)),diag:S.diag};
}
