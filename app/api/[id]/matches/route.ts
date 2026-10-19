import {NextResponse} from "next/server";
import {COMPS} from "@/lib/comps";
import type {Match,Group} from "@/lib/types";
import {fetchMatches,fetchStandings} from "@/lib/espn";
export const dynamic="force-dynamic";
export const maxDuration=60;
const snaps=new Map<string,{matches:Match[];table:Group[]|null;at:number}>(); // last good snapshot per competition (per instance)
const H={"Cache-Control":"public, s-maxage=10, stale-while-revalidate=20"};
export async function GET(_:Request,ctx:{params:Promise<{id:string}>}){
  const {id}=await ctx.params,c=COMPS.find(x=>x.id===id);
  if(!c)return NextResponse.json({error:"unknown competition"},{status:404});
  const [m,t]=await Promise.allSettled([fetchMatches(c),fetchStandings(c)]);
  if(m.status==="fulfilled"){
    const table=t.status==="fulfilled"&&t.value.length?t.value:snaps.get(id)?.table??null;
    const snap={matches:m.value,table,at:Date.now()};snaps.set(id,snap);
    return NextResponse.json({health:"LIVE",...snap},{headers:H});
  }
  const error=String((m.reason as Error)?.message??m.reason).slice(0,300);
  console.error("Provider failed:",id,error);
  const old=snaps.get(id);
  if(old)return NextResponse.json({health:"CACHED",...old,error},{headers:H});
  return NextResponse.json({health:"SEED",matches:[],table:null,at:null,error},{headers:H});
}
