export type Kind="league"|"uefa"|"cup"|"groups";
export interface Info{t:string;items:string[]}
export interface Feed{name:string;handle?:string;id?:string;must:string}
export interface Comp{id:string;slug:string;name:string;short:string;icon:string;kind:Kind;cat:"Domestic"|"Cups"|"Europe"|"International";start:string;end:string;total?:number;tag:string;season:string;theme:Record<string,string>;feeds:Feed[];info:Info[]}
// Colour schemes are inspired by each competition's public branding (not official assets).
const th=(bg:string,card:string,accent:string,accent2:string,on="#0b0b0b",text="#f3f3f7",muted="#a6a6ba")=>({"--bg":bg,"--card":card,"--line":`color-mix(in srgb, ${accent} 24%, transparent)`,"--text":text,"--muted":muted,"--accent":accent,"--accent2":accent2,"--on":on});

export const COMPS:Comp[]=[
{id:"pl",slug:"eng.1",name:"Premier League",short:"Premier League",icon:"🦁",kind:"league",cat:"Domestic",start:"2026-08-21",end:"2027-05-30",total:380,tag:"Live Season Tracker",season:"2026/27",theme:th("#1c0833","#2b0f4a","#00ff85","#ff2d87","#07120c"),
 feeds:[{name:"Premier League",handle:"premierleague",must:"premier league"}],
 info:[
 {t:"How the league works",items:["20 clubs play each other home and away: 38 matches each, 380 in total.","Win 3 points, draw 1, loss 0. The bottom three are relegated to the EFL Championship.","Coventry City, Ipswich Town and Hull City came up, replacing West Ham, Burnley and Wolves.","Arsenal are the reigning champions (first title in 22 years)."]},
 {t:"Table order",items:["Points, then goal difference, then goals scored.","Only if the title, relegation or a European place is still undecided after the last matchweek: head-to-head points, head-to-head away goals, then a neutral-site play-off (Premier League Handbook 2026/27)."]},
 {t:"European places",items:["Top 4: Champions League.","5th: Europa League, or the Champions League if England earns one of the extra places for the two best-ranked associations.","FA Cup winners: Europa League. If they finish in the top five, 6th place takes that spot."]},
 {t:"New this season",items:["Five-second countdown for delayed throw-ins and goal-kicks.","Ten seconds for a substituted player to leave the pitch.","Injured players must stay off for at least one minute.","VAR can overturn a clearly wrong second yellow card.","Trial: after a goalkeeper injury stoppage, the team takes an outfield player off.","Yellow card for hair-pulling; no gambling sponsors on the front of match shirts."]},
 {t:"Season dates",items:["21 Aug 2026 – 30 May 2027 (opening and final weeks moved back a week for the World Cup).","Four international breaks, including a first-ever three-week break in late Sep–early Oct.","Winter transfer window: 1 Jan – 1 Feb 2027."]}]},
{id:"champ",slug:"eng.2",name:"EFL Championship",short:"Championship",icon:"🛡️",kind:"league",cat:"Domestic",start:"2026-08-14",end:"2027-05-31",total:552,tag:"Sky Bet Championship · Live Tracker",season:"2026/27",theme:th("#0a1330","#12204a","#f5c542","#ff4d5a","#141000"),feeds:[],
 info:[
 {t:"How the league works",items:["24 clubs, 46 matches each (552 in total), 14 Aug 2026 – 1 May 2027.","Win 3, draw 1, loss 0. The bottom three are relegated to League One.","West Ham, Burnley and Wolves are playing here after relegation from the Premier League."]},
 {t:"Promotion",items:["The top two are promoted to the Premier League.","This is the first season with a six-team play-off: 3rd–6th place, with 3rd and 4th entering at the semi-finals and 5th and 6th at the quarter-finals.","The play-off winner takes the third promotion place."]},
 {t:"Table order",items:["Points, then goal difference, then goals scored (EFL regulations)."]}]},
{id:"laliga",slug:"esp.1",name:"La Liga",short:"La Liga",icon:"🇪🇸",kind:"league",cat:"Domestic",start:"2026-08-15",end:"2027-05-31",total:380,tag:"LALIGA EA SPORTS · Live Tracker",season:"2026/27",theme:th("#110d0d","#211a1a","#ff4b44","#ffb4a8","#1a0504"),feeds:[],
 info:[
 {t:"How the league works",items:["20 clubs, 38 matches each, 15 Aug 2026 – 30 May 2027.","The bottom three are relegated to the Segunda División (LALIGA Hypermotion).","Racing de Santander, Deportivo de La Coruña and Málaga came up, replacing Mallorca, Girona and Real Oviedo."]},
 {t:"Table order",items:["La Liga separates clubs level on points by head-to-head first: head-to-head points, then head-to-head goal difference, then overall goal difference.","This is why a team can finish above another with a worse overall goal difference."]},
 {t:"European places",items:["Champions League, Europa League and Conference League places are shown from the competition's own table labels. The exact number depends on Spain's UEFA allocation and cup results."]}]},
{id:"seriea",slug:"ita.1",name:"Serie A",short:"Serie A",icon:"🇮🇹",kind:"league",cat:"Domestic",start:"2026-08-22",end:"2027-05-31",total:380,tag:"Serie A Enilive · Live Tracker",season:"2026/27",theme:th("#06182c","#0d2a4a","#37a2ff","#2de2b4","#04111f"),feeds:[],
 info:[
 {t:"How the league works",items:["20 clubs, 38 matches each, 22 Aug 2026 – 30 May 2027. Inter are the defending champions.","Frosinone, Monza and Venezia were promoted. The bottom three (18th–20th) are relegated to Serie B."]},
 {t:"Table order",items:["Serie A applies head-to-head results first for clubs level on points: head-to-head points, then head-to-head goal difference, then overall goal difference and goals scored.","A play-off can be needed if the title or relegation is decided on level points."]},
 {t:"Calendar",items:["Long break 21 Sep – 6 Oct, then 9–17 Nov and 22–30 Mar.","Midweek rounds on 28 Oct 2026 and 6 Jan 2027; Christmas break 26–27 Dec."]}]},
{id:"bundesliga",slug:"ger.1",name:"Bundesliga",short:"Bundesliga",icon:"🇩🇪",kind:"league",cat:"Domestic",start:"2026-08-20",end:"2027-05-31",total:306,tag:"Bundesliga · Live Tracker",season:"2026/27",theme:th("#120c0e","#231619","#e3000f","#ffffff","#ffffff"),feeds:[],
 info:[
 {t:"How the league works",items:["18 clubs, 34 matchdays, 306 matches: 20 Aug 2026 – 22 May 2027, with a winter break after matchday 14 (18–20 Dec).","The bottom two (17th–18th) are relegated to the 2. Bundesliga.","16th place plays a two-legged relegation play-off against the third-placed 2. Bundesliga club.","Schalke 04 and Elversberg were promoted directly."]},
 {t:"Table order",items:["Points, then goal difference, then goals scored."]}]},
{id:"ligue1",slug:"fra.1",name:"Ligue 1",short:"Ligue 1",icon:"🇫🇷",kind:"league",cat:"Domestic",start:"2026-08-08",end:"2027-05-31",total:306,tag:"Ligue 1 · Live Tracker",season:"2026/27",theme:th("#0a1233","#141f52","#d8e43a","#6ea8ff","#141800"),feeds:[],
 info:[
 {t:"How the league works",items:["18 clubs play each other home and away: 34 matches each, 306 in total, August 2026 – May 2027.","The bottom two are relegated and 16th place goes into a relegation play-off, as shown in the table labels."]},
 {t:"European places",items:["The table labels show Champions League, Champions League qualifying, Europa League and Conference League places as published by the data provider."]}]},
{id:"carabao",slug:"eng.league_cup",name:"Carabao Cup",short:"Carabao Cup",icon:"🏆",kind:"cup",cat:"Cups",start:"2026-08-10",end:"2027-03-31",tag:"EFL Cup · Live Tracker",season:"2026/27",theme:th("#06190f","#0e2d1b","#c6f432","#ffd60a","#0b1300"),feeds:[],
 info:[
 {t:"Format",items:["Straight knockout for the 92 clubs of the Premier League, Championship, League One and League Two.","The 11 Premier League clubs not in Europe enter in round 2; the nine in UEFA competitions enter in round 3 (32 teams).","Drawn matches go to penalties (shown under the score)."]},
 {t:"Key dates",items:["Round 2: week of 24 Aug 2026 · Round 4: week of 26 Oct · Round 5: week of 4 Dec.","Final: Sunday 21 March 2027 at Wembley."]}]},
{id:"facup",slug:"eng.fa",name:"FA Cup",short:"FA Cup",icon:"🏅",kind:"cup",cat:"Cups",start:"2026-08-01",end:"2027-05-31",tag:"The FA Cup · Live Tracker",season:"2026/27",theme:th("#1d0a12","#321320","#ff4d5e","#f4d8a8","#1a0206"),feeds:[],
 info:[
 {t:"Format",items:["Knockout competition open to clubs across the English football pyramid; Premier League and Championship clubs join in the third round in January (the usual format).","Matches appear here as soon as the data provider lists them. The early rounds may not be covered."]}]},
{id:"ucl",slug:"uefa.champions",name:"Champions League",short:"Champions League",icon:"⭐",kind:"uefa",cat:"Europe",start:"2026-09-08",end:"2027-06-06",tag:"UEFA Champions League · Live Tracker",season:"2026/27",theme:th("#040a22","#0c1744","#5aa9ff","#ffffff","#031024"),feeds:[],
 info:[
 {t:"League phase",items:["36 teams in a single table, each playing 8 different opponents (4 home, 4 away).","Top 8: straight to the round of 16. 9th–24th: two-legged knockout play-off. 25th–36th: eliminated.","Matchdays: 8–10 Sep, 13–14 Oct, 20–21 Oct, 3–4 Nov, 24–25 Nov, 8–9 Dec, 19–20 Jan, 27 Jan."]},
 {t:"Knockout phase",items:["Play-offs: 16–17 and 23–24 Feb 2027. Then two-legged ties through the semi-finals (27–28 Apr and 4–5 May).","Final: 5 June 2027 at the Metropolitano, Madrid."]}]},
{id:"uel",slug:"uefa.europa",name:"Europa League",short:"Europa League",icon:"🟠",kind:"uefa",cat:"Europe",start:"2026-09-20",end:"2027-05-28",tag:"UEFA Europa League · Live Tracker",season:"2026/27",theme:th("#0a0a0a","#1b1b1b","#ff7a1a","#ffd0a8","#150800"),feeds:[],
 info:[
 {t:"League phase",items:["36 teams, 8 matches each in one table. Top 8 go straight to the round of 16; 9th–24th play a two-legged play-off.","Matchdays: 24–25 Sep, 15 Oct, 22 Oct, 5 Nov, 26 Nov, 10 Dec, 21 Jan, 28 Jan."]},
 {t:"Final and prize",items:["Final: 26 May 2027 in Frankfurt.","The winners enter the 2027/28 Champions League league phase if not already qualified, and face the Champions League winners in the Super Cup."]}]},
{id:"nl",slug:"uefa.nations",name:"Nations League",short:"Nations League",icon:"🌍",kind:"groups",cat:"International",start:"2026-09-20",end:"2027-06-14",total:156,tag:"UEFA Nations League · Live Tracker",season:"2026/27",theme:th("#06192a","#0c2c47","#2ee59d","#8b7bff","#031a10"),feeds:[{name:"DAZN Football",id:"UCSZ21xyG8w_33KriMM69IxQ",must:"nations league"}],
 info:[
 {t:"Format",items:["54 teams in 14 groups: Leagues A, B and C have four groups of four; League D has two groups of three.","Home-and-away round robin. Win 3, draw 1, loss 0. 156 league-phase matches in total (48 × 3 + 12).","League phase: 24 Sep – 17 Nov 2026. Quarter-finals and play-offs: 25–30 Mar 2027. Finals: 9–13 Jun 2027 (host to be confirmed)."]},
 {t:"Promotion and relegation",items:["League A: winners and runners-up reach the quarter-finals; the two best 3rd-placed teams stay; two worst 3rd + two best 4th play A/B play-offs; two worst 4th are relegated.","League B: winners promoted; runners-up play A/B play-offs; 3rd stays; 4th plays B/C play-offs.","League C: winners promoted; runners-up play B/C play-offs; 3rd and 4th stay.","League D: all teams promoted to League C (League D is removed after this edition)."]}]}
];
export const GROUPED=["Domestic","Cups","Europe","International"] as const;
