import {NextResponse} from "next/server";
import {COMPS} from "@/lib/comps";
import {fetchMatches,fetchStandings} from "@/lib/espn";
export const dynamic="force-dynamic";
export const maxDuration=60;
// Diagnostics: one line per competition (matches found, played, table groups/zones, next fixture).
export async function GET(){
  const out=await Promise.all(COMPS.map(async c=>{
    const [m,t]=await Promise.allSettled([fetchMatches(c),fetchStandings(c)]);
    const ms=m.status==="fulfilled"?m.value:[],tb=t.status==="fulfilled"?t.value:[];
    const next=ms.filter(x=>x.status==="UPCOMING"&&x.kickoff).sort((a,b)=>a.kickoff!.localeCompare(b.kickoff!))[0];
    return {id:c.id,matches:ms.length,played:ms.filter(x=>x.status==="FULL_TIME").length,live:ms.filter(x=>x.status==="LIVE"||x.status==="HALF_TIME").length,
      rounds:[...new Set(ms.map(x=>x.round))].slice(0,8),groups:tb.length,rows:tb[0]?.rows.length??0,zones:[...new Set(tb.flatMap(g=>g.rows.map(r=>r.zone)))].slice(0,8),
      lead:tb[0]?.rows[0]?`${tb[0].rows[0].team} ${tb[0].rows[0].pts}pts/${tb[0].rows[0].p}p`:null,next:next?`${next.home} v ${next.away} ${next.kickoff}`:null,
      err:[m.status==="rejected"?String(m.reason?.message):"",t.status==="rejected"?String(t.reason?.message):""].filter(Boolean).join(" | ")||undefined};
  }));
  return NextResponse.json(out);
}
