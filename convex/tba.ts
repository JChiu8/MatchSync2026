import { action } from "./_generated/server";
import { v } from "convex/values";

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
const TBA_API_KEY = runtime.process?.env?.TBA_API_KEY ?? "E1eFW98krCsKYbIsUCctQcxp7tJSDHwxOqCaooVpB2I08kSHKFkE7lK8ELuwrJdh";

type TbaMatch = {
  key: string;
  event_key: string;
  comp_level: string;
  set_number: number;
  match_number: number;
  time: number;
  alliances: {
    red: { team_keys: string[]; score: number };
    blue: { team_keys: string[]; score: number };
  };
  videos?: { type: string; key: string }[];
};

type TbaEvent = { key: string; name: string; city?: string; state_prov?: string };

async function tbaFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://www.thebluealliance.com/api/v3${path}`, {
    headers: { "X-TBA-Auth-Key": TBA_API_KEY, "User-Agent": "6696-MatchSync/1.0" },
  });
  if (!response.ok) throw new Error(`The Blue Alliance returned ${response.status}.`);
  return (await response.json()) as T;
}

export const listTeamMatches = action({
  args: { teamNumber: v.string(), year: v.optional(v.number()) },
  returns: v.array(v.object({
    key: v.string(),
    eventKey: v.string(),
    eventName: v.string(),
    eventLocation: v.string(),
    label: v.string(),
    matchNumber: v.number(),
    compLevel: v.string(),
    alliance: v.union(v.literal("red"), v.literal("blue")),
    score: v.number(),
    opponentScore: v.number(),
    videoId: v.union(v.string(), v.null()),
  })),
  handler: async (_ctx, args) => {
    const teamNumber = args.teamNumber.trim().replace(/^frc/i, "");
    if (!/^\d+$/.test(teamNumber)) throw new Error("Enter a numeric team number.");
    const year = args.year ?? 2026;
    const teamKey = `frc${teamNumber}`;
    const matches = await tbaFetch<TbaMatch[]>(`/team/${teamKey}/matches/${year}`);
    const eventKeys = [...new Set(matches.map((match) => match.event_key))];
    const events = await Promise.all(eventKeys.map((eventKey) => tbaFetch<TbaEvent>(`/event/${eventKey}`)));
    const eventMap = new Map(events.map((event) => [event.key, event]));
    return matches
      .filter((match) => match.comp_level !== "other" && match.videos?.some((video) => video.type === "youtube"))
      .sort((a, b) => a.time - b.time)
      .map((match) => {
        const alliance = match.alliances.red.team_keys.includes(teamKey) ? "red" : "blue";
        const own = match.alliances[alliance];
        const opponent = match.alliances[alliance === "red" ? "blue" : "red"];
        const event = eventMap.get(match.event_key);
        const level = match.comp_level === "qm" ? "Qualification" : match.comp_level === "sf" ? "Semifinal" : match.comp_level === "f" ? "Final" : match.comp_level.toUpperCase();
        const matchLabel = match.comp_level === "sf" ? `${level} ${match.set_number}` : `${level} ${match.match_number}`;
        return {
          key: match.key,
          eventKey: match.event_key,
          eventName: event?.name ?? match.event_key,
          eventLocation: [event?.city, event?.state_prov].filter(Boolean).join(", "),
          label: `${event?.name ?? match.event_key} · ${matchLabel} · ${alliance === "red" ? "Red" : "Blue"}`,
          matchNumber: match.match_number,
          compLevel: level,
          alliance: alliance as "red" | "blue",
          score: own.score,
          opponentScore: opponent.score,
          videoId: match.videos?.find((video) => video.type === "youtube")?.key ?? null,
        };
      });
  },
});
