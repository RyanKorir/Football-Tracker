# ⚽ Football Tracker

**Every competition, one place — and the whole site re-themes itself to match the one you pick.**

Live tables, fixtures, top scorers and highlights for 11 competitions, with a one-tap switcher:

| Domestic | Cups | Europe | International |
|---|---|---|---|
| Premier League · EFL Championship · La Liga · Serie A · Bundesliga · Ligue 1 | Carabao Cup · FA Cup | Champions League · Europa League | Nations League |

## Highlights

- **One-tap competition switcher** with a theme per competition (colours inspired by each one's branding).
- **Official tables** with qualification, promotion and relegation zones, club crests and a form guide.
- **Fixtures by matchweek or round**, with live scores refreshing every 15–30 seconds.
- **Champions/Europa League** league-phase table plus a knockout rounds board; **cups** with penalty results.
- **Nations League** group tables and a clickable tree view from groups to promotion, relegation and the final.
- **Top scorers and assisters** (top 5) per competition.
- **Highlights only where they play:** free official YouTube highlights are shown only when playable in the visitor's country.
- **Honest data labels:** live, cached or offline is always shown.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Deploys to Vercel with zero config. Add a competition by adding one entry to `lib/comps.ts` (ESPN slug, dates, theme, rules text).

## How it's built

| Piece | File |
|---|---|
| Competitions, themes, rules text | `lib/comps.ts` |
| Matches and official standings (ESPN, per-day, cached) | `lib/espn.ts` |
| Player stats | `lib/stats.ts` |
| Highlights discovery and country check | `lib/highlights.ts` |
| Switcher, tables, fixtures, board | `app/page.tsx` |
| Nations League tree | `app/Tree.tsx` |

## Known limits

- ESPN's feeds are unofficial and can change without notice.
- Matchweeks are derived from each club's match order, so rearranged fixtures may differ from the official week.
- Highlight availability depends on publishers' territory rules; most competitions currently have no free worldwide source.
- Rules text is summarised from official publications; check each league's regulations for final decisions.

Not affiliated with any league or club.
