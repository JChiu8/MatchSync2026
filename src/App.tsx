import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConvexProvider, useAction } from "convex/react";
import {
  RouterProvider,
  createBrowserRouter,
  useLocation,
  useNavigate,
  Link,
} from "react-router";
import { api } from "../convex/_generated/api";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import YouTube, { type YouTubePlayer } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { convex } from "@/lib/convex";

type Match = {
  key: string;
  eventName: string;
  eventLocation: string;
  label: string;
  matchNumber: number;
  compLevel: string;
  alliance: "red" | "blue";
  score: number;
  opponentScore: number;
  videos: VideoOption[];
};
type VideoOption = { videoId: string; channelName: string };

function normalizeMatch(match: Match & { videoId?: string | null }): Match {
  return {
    ...match,
    videos:
      match.videos ??
      (match.videoId
        ? [{ videoId: match.videoId, channelName: "YouTube channel" }]
        : []),
  };
}
function Header() {
  return (
    <header className="border-b border-white/10 bg-[#08090c]/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-red-600 font-black italic text-white">
            6
          </span>
          <span className="font-display text-lg font-bold text-white">
            6696 <span className="text-red-500">MatchSync</span>
          </span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          2026 season · scout mode
        </span>
      </div>
    </header>
  );
}
function Picker({
  slot,
  value,
  setValue,
}: {
  slot: number;
  value: Match | null;
  setValue: (m: Match | null) => void;
}) {
  const action = useAction(api.tba.listTeamMatches);
  const [team, setTeam] = useState("");
  const [rows, setRows] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);
  async function find(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await action({ teamNumber: team, year: 2026 });
      setRows(
        (result as Array<Match & { videoId?: string | null }>).map(
          normalizeMatch,
        ),
      );
      setValue(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not reach The Blue Alliance.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-red-400">
        0{slot} · match slot
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">
        {slot === 1 ? "First angle" : "Second angle"}
      </h2>
      <form className="mt-5 flex gap-2" onSubmit={(e) => void find(e)}>
        <div className="relative flex-1">
          <Users className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team number"
            aria-label={`Team number for match ${slot}`}
            className="h-11 bg-black/20 pl-10 text-white"
            inputMode="numeric"
          />
        </div>
        <Button
          type="submit"
          disabled={!team.trim() || busy}
          className="h-11 bg-red-600 text-white"
        >
          {busy ? <LoaderCircle className="animate-spin" /> : "Find"}
        </Button>
      </form>
      <Label className="mt-4 block text-xs uppercase tracking-widest text-zinc-500">
        {rows.length ? `${rows.length} matches with video` : "Select a match"}
      </Label>
      <select
        value={value?.key ?? ""}
        onChange={(e) =>
          setValue(rows.find((row) => row.key === e.target.value) ?? null)
        }
        disabled={!rows.length}
        className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#111318] px-3 text-sm text-zinc-200"
      >
        <option value="">
          {rows.length
            ? "Choose an event match…"
            : "Search a team to load matches"}
        </option>
        {rows.map((row) => (
          <option key={row.key} value={row.key}>
            {row.label}
          </option>
        ))}
      </select>
      {value ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-red-500/10 p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-bold text-white">{value.eventName}</p>
              <p className="text-xs text-zinc-400">
                {value.eventLocation} · {value.compLevel} {value.matchNumber}
              </p>
            </div>
            <span className="text-xs font-black uppercase text-white">
              {value.alliance}
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-xs text-zinc-400">
            <Trophy className="size-3.5" />
            {value.score} – {value.opponentScore}
            <span className="ml-auto">
          <Video className="mr-1 inline size-3.5" />
              {value.videos.length} video{value.videos.length === 1 ? "" : "s"} ready
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
function Setup() {
  const [first, setFirst] = useState<Match | null>(null);
  const [second, setSecond] = useState<Match | null>(null);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400">
          <Sparkles className="size-4" />
          Match analysis workspace
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-white">
          Put two matches
          <br />
          <span className="text-red-500">under the microscope.</span>
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-zinc-400">
          Choose two 2026 matches from The Blue Alliance and compare them from
          the field-on moment.
        </p>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Picker slot={1} value={first} setValue={setFirst} />
          <Picker slot={2} value={second} setValue={setSecond} />
        </div>
        <div className="mt-5 flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center">
          <span className="flex items-center gap-3 text-sm text-zinc-400">
            <CircleHelp className="size-5" />
            Select two match videos to unlock the viewer.
          </span>
          <Button
            disabled={!first || !second}
            onClick={() => navigate("/view", { state: { first, second } })}
            className="h-12 bg-red-600 font-bold text-white"
          >
            Open synced viewer <ChevronRight />
          </Button>
        </div>
      </main>
    </div>
  );
}
function HoldButton({
  amount,
  label,
  onStep,
  text,
  large = false,
}: {
  amount: number;
  label: string;
  onStep: (n: number) => void;
  text: string;
  large?: boolean;
}) {
  const timeout = useRef<number | undefined>(undefined);
  const interval = useRef<number | undefined>(undefined);
  const stop = () => {
    if (timeout.current !== undefined) window.clearTimeout(timeout.current);
    if (interval.current !== undefined) window.clearInterval(interval.current);
    timeout.current = undefined;
    interval.current = undefined;
  };
  const start = () => {
    stop();
    onStep(amount);
    timeout.current = window.setTimeout(() => {
      interval.current = window.setInterval(
        () => onStep(amount),
        text.includes("s") ? 1000 / 4 : 1000 / 12,
      );
    }, 500);
  };
  const pointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    start();
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={pointerDown}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onContextMenu={(e) => e.preventDefault()}
      className={`${large ? "h-10 min-w-14 px-2" : "h-8 min-w-8 px-1.5"} inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/20 text-zinc-300 hover:bg-white/10`}
    >
      {large ? (
        <span className="font-mono text-xs font-bold">{text}</span>
      ) : text.includes("s") ? (
        <span className="font-mono text-[10px] font-bold">{text}</span>
      ) : amount < 0 ? (
        <SkipBack className="size-4" />
      ) : (
        <SkipForward className="size-4" />
      )}
    </button>
  );
}
function VideoCard({
  match,
  current,
  offset,
  poster,
  onReady,
  activate,
  setOffset,
  setAuto,
  stepFrame,
  stepSecond,
}: {
  match: Match;
  current: number;
  offset: number;
  poster: boolean;
  onReady: (player: YouTubePlayer | null) => void;
  activate: () => void;
  setOffset: (n: number) => void;
  setAuto: () => void;
  stepFrame: (n: number) => void;
  stepSecond: (n: number) => void;
}) {
  const [selectedVideo, setSelectedVideo] = useState<VideoOption | null>(
    match.videos.length === 1 ? match.videos[0] : null,
  );
  const hasSelection = selectedVideo !== null;

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="absolute left-3 top-3 z-30 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          {match.eventName}
        </div>
        {hasSelection ? (
          <YouTube
            key={selectedVideo.videoId}
            videoId={selectedVideo.videoId}
            title={`Match video from ${selectedVideo.channelName}`}
            className="h-full w-full"
            iframeClassName="h-full w-full"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: { playsinline: 1, rel: 0 },
            }}
            onReady={(event) => onReady(event.target)}
          />
        ) : null}
        {poster && hasSelection ? (
          <div className="absolute inset-0 z-20 bg-black">
            <img
              src={`https://i.ytimg.com/vi/${selectedVideo.videoId}/hqdefault.jpg`}
              alt={`Thumbnail from ${selectedVideo.channelName}`}
              className="h-full w-full object-cover opacity-80"
            />
            <button
              onClick={activate}
              className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white"
            >
              <Play className="size-4 fill-current" />
              Load player
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 rounded-xl border border-white/20 bg-black/60 px-3 py-2.5 text-xs font-bold text-white"
            >
              Open on YouTube
            </a>
          </div>
        ) : null}
        {!hasSelection ? (
          <div className="absolute inset-0 z-20 flex flex-col justify-center bg-[#111318] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-red-300">
              Choose a video
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Select the angle you want to use before loading its thumbnail.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {match.videos.map((video, index) => (
                <button
                  key={video.videoId}
                  type="button"
                  onClick={() => {
                    onReady(null);
                    setSelectedVideo(video);
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-left hover:border-red-400/70 hover:bg-red-500/10"
                >
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Video {index + 1}
                  </span>
                  <span className="mt-1 block truncate text-sm font-bold text-white">
                    {video.channelName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="text-zinc-500">
            Source <span className="font-bold text-zinc-200">{selectedVideo?.channelName ?? "Choose a video"}</span>
          </span>
          {match.videos.length > 1 ? (
            <div className="flex flex-wrap gap-1">
              {match.videos.map((video, index) => (
                <button
                  key={video.videoId}
                  type="button"
                  onClick={() => {
                    onReady(null);
                    setSelectedVideo(video);
                  }}
                  className={`rounded-md px-2 py-1 font-bold ${selectedVideo?.videoId === video.videoId ? "bg-red-500/20 text-red-200" : "text-zinc-500 hover:text-zinc-200"}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-xs">
          <span className="text-zinc-500">
            Current{" "}
            <span className="font-mono text-zinc-200">
              {current.toFixed(2)}s
            </span>
          </span>
          <span className="text-zinc-500">
            Auto{" "}
            <span className="font-mono text-zinc-200">
              {offset.toFixed(2)}s
            </span>
          </span>
          <button
            type="button"
            onClick={setAuto}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-bold text-red-200"
          >
            Use current as auto start
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <HoldButton
            amount={-1}
            text="−1f"
            label="Previous frame for this video"
            onStep={(n) => hasSelection && stepFrame(n)}
          />
          <HoldButton
            amount={1}
            text="+1f"
            label="Next frame for this video"
            onStep={(n) => hasSelection && stepFrame(n)}
          />
          <HoldButton
            amount={-1}
            text="−1s"
            label="Back one second for this video"
            onStep={(n) => hasSelection && stepSecond(n)}
          />
          <HoldButton
            amount={1}
            text="+1s"
            label="Forward one second for this video"
            onStep={(n) => hasSelection && stepSecond(n)}
          />
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">
            hold to scan
          </span>
          <label className="ml-auto text-xs text-zinc-500">
            Offset{" "}
            <input
              type="number"
              min="0"
              step="0.01"
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value) || 0)}
              className="ml-1 w-20 rounded border border-white/10 bg-black/30 px-2 py-1 font-mono text-zinc-200"
            />
            s
          </label>
        </div>
      </div>
    </div>
  );
}
function Viewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { first?: Match; second?: Match } | null;
  const first = state?.first;
  const second = state?.second;
  const refs = useRef<(YouTubePlayer | null)[]>([null, null]);
  const timesRef = useRef([0, 0]);
  const positionRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(true);
  const [times, setTimes] = useState([0, 0]);
  const [offsets, setOffsets] = useState([0, 0]);
  const [playbackRate, setPlaybackRate] = useState(1);
  useEffect(() => {
    if (!first || !second) navigate("/", { replace: true });
  }, [first, second, navigate]);
  useEffect(() => {
    const poll = window.setInterval(() => {
      void Promise.all(
        refs.current.map(async (player, index) => {
          if (!player) return timesRef.current[index];
          const current = await player.getCurrentTime();
          return Number.isFinite(current) ? current : timesRef.current[index];
        }),
      ).then((currentTimes) => {
        timesRef.current = currentTimes;
        setTimes([...currentTimes]);
      });
    }, 100);
    return () => window.clearInterval(poll);
  }, []);
  if (!first || !second) return null;
  const readCurrent = async (index: number) => {
    const player = refs.current[index];
    if (!player) return timesRef.current[index];
    const current = await player.getCurrentTime();
    if (Number.isFinite(current)) {
      timesRef.current[index] = current;
      setTimes([...timesRef.current]);
      return current;
    }
    return timesRef.current[index];
  };
  const seek = (index: number, time: number) => {
    const next = Math.max(0, time);
    void refs.current[index]?.seekTo(next, true);
    timesRef.current[index] = next;
    setTimes([...timesRef.current]);
  };
  const activate = () => setPoster(false);
  const stepFrame = async (index: number, amount: number) => {
    activate();
    seek(index, (await readCurrent(index)) + amount / 30);
  };
  const stepSecond = async (index: number, amount: number) => {
    activate();
    seek(index, (await readCurrent(index)) + amount);
  };
  const syncedPosition = Math.max(
    0,
    Math.min(
      timesRef.current[0] - offsets[0],
      timesRef.current[1] - offsets[1],
    ),
  );
  const stepBoth = async (amount: number) => {
    activate();
    const current = await Promise.all([readCurrent(0), readCurrent(1)]);
    seek(0, current[0] + amount);
    seek(1, current[1] + amount);
    const nextPosition = Math.max(
      0,
      Math.min(current[0] + amount - offsets[0], current[1] + amount - offsets[1]),
    );
    positionRef.current = nextPosition;
  };
  const stepBothFrame = (amount: number) => void stepBoth(amount / 30);
  const stepBothSecond = (amount: number) => void stepBoth(amount);
  const reset = () => {
    activate();
    positionRef.current = 0;
    seek(0, offsets[0]);
    seek(1, offsets[1]);
    setPlaying(false);
  };
  const play = () => {
    activate();
    if (!playing && syncedPosition === 0) {
      seek(0, offsets[0]);
      seek(1, offsets[1]);
      positionRef.current = 0;
    }
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    refs.current.forEach((player) => {
      if (playing) {
        void player?.pauseVideo();
      } else {
        // Mobile browsers allow multiple players to start from one gesture
        // when they begin muted. Scouts can use either YouTube player's own
        // audio control if they want sound.
        if (mobile) void player?.mute();
        void player?.playVideo();
      }
    });
    setPlaying(!playing);
  };
  const changeRate = () => {
    const next = playbackRate === 1 ? 0.5 : playbackRate === 0.5 ? 0.25 : 1;
    setPlaybackRate(next);
    refs.current.forEach((player) => void player?.setPlaybackRate(next));
  };
  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100">
      <Header />
      <main className="w-full px-2 py-5 sm:px-3">
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500"
          >
            <ArrowLeft className="size-4" />
            Change matches
          </button>
          <h1 className="text-3xl font-black text-white">
            Synchronized viewer
          </h1>
          <p className="text-sm text-zinc-500">
            Calibrate field-on, then compare each match frame by frame.
          </p>
        </div>
        <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-zinc-400">
          <b className="text-red-300">Calibration:</b> scrub each player to
          field-on, then use the current time as auto start. Hold frame or
          second controls to scan.
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          <VideoCard
            match={first}
            current={times[0]}
            offset={offsets[0]}
            poster={poster}
            onReady={(player) => {
              refs.current[0] = player;
            }}
            activate={activate}
            setOffset={(n) => setOffsets((v) => [n, v[1]])}
            setAuto={() => {
              void readCurrent(0).then((current) =>
                setOffsets((v) => [current, v[1]]),
              );
            }}
            stepFrame={(n) => stepFrame(0, n)}
            stepSecond={(n) => stepSecond(0, n)}
          />
          <VideoCard
            match={second}
            current={times[1]}
            offset={offsets[1]}
            poster={poster}
            onReady={(player) => {
              refs.current[1] = player;
            }}
            activate={activate}
            setOffset={(n) => setOffsets((v) => [v[0], n])}
            setAuto={() => {
              void readCurrent(1).then((current) =>
                setOffsets((v) => [v[0], current]),
              );
            }}
            stepFrame={(n) => stepFrame(1, n)}
            stepSecond={(n) => stepSecond(1, n)}
          />
        </div>
        <div className="mt-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
            Both videos · synchronized controls
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <HoldButton
              amount={-1}
              text="−1f"
              large
              label="Previous frame on both videos"
              onStep={stepBothFrame}
            />
            <HoldButton
              amount={1}
              text="+1f"
              large
              label="Next frame on both videos"
              onStep={stepBothFrame}
            />
            <HoldButton
              amount={-1}
              text="−1s"
              large
              label="Back one second on both videos"
              onStep={stepBothSecond}
            />
            <HoldButton
              amount={1}
              text="+1s"
              large
              label="Forward one second on both videos"
              onStep={stepBothSecond}
            />
            <Button
              onClick={play}
              size="lg"
              className="min-w-32 bg-red-600 font-black text-white"
            >
              {playing ? <Pause /> : <Play />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={reset}
              aria-label="Reset both videos to auto start"
              className="border-white/10 bg-black/20"
            >
              <RotateCcw />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={changeRate}
              className="border-white/10 bg-black/20 font-mono text-xs"
            >
              {playbackRate}×
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-600">
            Both videos · {playbackRate}× · {syncedPosition.toFixed(2)} sec from
            auto
          </p>
        </div>
      </main>
    </div>
  );
}
const router = createBrowserRouter(
  [
    { path: "/", element: <Setup /> },
    { path: "/view", element: <Viewer /> },
  ],
  { basename: import.meta.env.BASE_URL },
);
export default function App() {
  return (
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
      <Toaster />
    </ConvexProvider>
  );
}
