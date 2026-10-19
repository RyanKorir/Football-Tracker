export type Status="UPCOMING"|"LIVE"|"HALF_TIME"|"FULL_TIME"|"POSTPONED"|"CANCELLED"|"ABANDONED";
export interface Match{id:string;home:string;away:string;hg:number|null;ag:number|null;status:Status;kickoff?:string;minute?:string;mw?:number;round?:string;note?:string;hl?:string;al?:string}
export interface Row{team:string;logo?:string;pos:number;p:number;w:number;d:number;l:number;gf:number;ga:number;gd:number;pts:number;zone:string}
export interface Group{name:string;rows:Row[]}
