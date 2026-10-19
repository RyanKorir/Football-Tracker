import {NextResponse} from "next/server";
import {COMPS} from "@/lib/comps";
import {getHighlights} from "@/lib/highlights";
export const dynamic="force-dynamic";
// Returns only highlights verified as playable in the visitor's country (Vercel provides it; ?country=XX overrides for testing).
export async function GET(req:Request,ctx:{params:Promise<{id:string}>}){
  const {id}=await ctx.params,c=COMPS.find(x=>x.id===id);
  const country=(new URL(req.url).searchParams.get("country")||req.headers.get("x-vercel-ip-country")||"").toUpperCase();
  if(!c)return NextResponse.json({error:"unknown competition"},{status:404});
  try{
    const {vids,diag}=await getHighlights(c);
    const videos=vids.filter(v=>v.countries===null||(!!country&&!!v.countries?.includes(country))).map(({countries,chk,...v})=>v);
    return NextResponse.json({country,videos,checked:vids.length,diag},{headers:{"Cache-Control":"private, max-age=120"}});
  }catch{return NextResponse.json({country,videos:[],checked:0})}
}
