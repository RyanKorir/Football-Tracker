import {NextResponse} from "next/server";
import {COMPS} from "@/lib/comps";
import {getStats} from "@/lib/stats";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(_:Request,ctx:{params:Promise<{id:string}>}){
  const {id}=await ctx.params,c=COMPS.find(x=>x.id===id);
  if(!c)return NextResponse.json({error:"unknown competition"},{status:404});
  try{return NextResponse.json(await getStats(c),{headers:{"Cache-Control":"public, s-maxage=30, stale-while-revalidate=60"}})}
  catch(e){return NextResponse.json({error:String((e as Error).message)},{status:502})}
}
