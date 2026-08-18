import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepType = "system" | "customer" | "ai" | "action" | "result" | "note-result";

interface Step {
  type: StepType;
  text: string;
  delay: number;
}

interface Scene {
  id: number;
  time: string;
  label: string;
  tag: string;
  tagColor: string;
  description: string;
  steps: Step[];
  reward: number | null;
}

// ─── Scene data ───────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  {
    id: 0,
    time: "7:12 AM",
    label: "Before hours",
    tag: "LeadLock",
    tagColor: "#C46A2E",
    description: "A customer calls before you're up. Normally it rings out.",
    reward: 2500,
    steps: [
      { type: "system",   text: "Incoming call · 7:12 AM · outside business hours",                                              delay: 200  },
      { type: "ai",       text: "Hi, thanks for calling. I can help get you scheduled. What's going on?",                        delay: 1000 },
      { type: "customer", text: "Need someone to come take a look at something, it's been bugging me for a while.",              delay: 1000 },
      { type: "ai",       text: "Happy to help. I have Thursday at 9 AM or Friday at 2 PM. Which works better for you?",         delay: 1400 },
      { type: "customer", text: "Thursday works.",                                                                               delay: 800  },
      { type: "ai",       text: "You're all set for Thursday at 9 AM. You'll get a confirmation text in just a moment.",         delay: 1200 },
      { type: "result",   text: "Booked · Thursday 9 AM · +$2,500",                                                             delay: 700  },
    ],
  },
  {
    id: 1,
    time: "9:00 AM",
    label: "Appointment reminder",
    tag: "Follow-Up Engine",
    tagColor: "#4A6B5E",
    description: "A customer has an appointment tomorrow. Without a reminder, they'll forget.",
    reward: 2500,
    steps: [
      { type: "system",   text: "Appointment tomorrow at 2:00 PM, reminder window triggered",                                    delay: 200  },
      { type: "action",   text: "SMS sent → \"Hi, just a reminder about your appointment tomorrow at 2:00 PM. Reply YES to confirm or call us to reschedule.\"", delay: 700 },
      { type: "customer", text: "YES",                                                                                           delay: 1400 },
      { type: "action",   text: "Confirmed. Appointment status updated. No further action needed.",                              delay: 600  },
      { type: "result",   text: "No-show avoided · +$2,500",                                                                     delay: 500  },
    ],
  },
  {
    id: 2,
    time: "11:45 AM",
    label: "Mid-job",
    tag: "Intake Guardian",
    tagColor: "#C46A2E",
    description: "A web form comes in while you're elbow-deep in a job. It would sit for hours.",
    reward: 2500,
    steps: [
      { type: "system",   text: "Web form submitted · 11:45 AM",                                                                  delay: 200  },
      { type: "action",   text: "Response sent in 28 seconds →",                                                                 delay: 500  },
      { type: "ai",       text: "Hey, saw your request. What's the best time to get someone out to you this week?",              delay: 700  },
      { type: "customer", text: "Thursday or Friday afternoon works for me.",                                                    delay: 1100 },
      { type: "action",   text: "Calendar checked. Thursday 3 PM available. Slot held.",                                         delay: 700  },
      { type: "ai",       text: "Thursday at 3 PM. Want me to lock that in?",                                                    delay: 1000 },
      { type: "customer", text: "Yes, perfect. Thank you.",                                                                      delay: 900  },
      { type: "result",   text: "Booked while you were on the job · +$2,500",                                                    delay: 600  },
    ],
  },
  {
    id: 3,
    time: "2:30 PM",
    label: "Cold lead reactivated",
    tag: "Follow-Up Engine",
    tagColor: "#4A6B5E",
    description: "Someone reached out 3 weeks ago and never heard back. They went quiet.",
    reward: 2500,
    steps: [
      { type: "system",   text: "Lead from 22 days ago, no follow-up logged",                                                    delay: 200  },
      { type: "action",   text: "Re-engagement SMS sent →",                                                                      delay: 700  },
      { type: "ai",       text: "Hey, just checking in on that estimate you asked about a few weeks back. Still something you're looking to get done?", delay: 800 },
      { type: "customer", text: "Actually yes. I kept putting it off but I still need it sorted.",                                delay: 1500 },
      { type: "ai",       text: "Happy to get you back on the schedule. Thursday or Friday this week. Any preference?",           delay: 1300 },
      { type: "customer", text: "Friday works.",                                                                                  delay: 900  },
      { type: "action",   text: "Booked for Friday. Lead status updated in CRM.",                                                delay: 600  },
      { type: "result",   text: "Cold lead recovered · +$2,500",                                                                 delay: 500  },
    ],
  },
  {
    id: 4,
    time: "4:15 PM",
    label: "Job complete",
    tag: "LeadLock",
    tagColor: "#C46A2E",
    description: "Job's done. No time to ask for a review, so you don't.",
    reward: null,
    steps: [
      { type: "system",   text: "Job #4821 marked complete · 4:15 PM",                                                           delay: 200  },
      { type: "action",   text: "Review request sent 4 minutes after close →",                                                  delay: 700  },
      { type: "ai",       text: "Thanks for having us out today. Hope everything went well. If you have 30 seconds, a quick Google review means a lot to us: [link]", delay: 800 },
      { type: "note-result", text: "One more five-star review, building trust for the next person who checks before they call.", delay: 700  },
    ],
  },
  {
    id: 5,
    time: "6:30 PM",
    label: "Invoice follow-up",
    tag: "CRM Autopilot",
    tagColor: "#4A6B5E",
    description: "An invoice has been sitting unpaid for three days. You haven't had time to chase it.",
    reward: null,
    steps: [
      { type: "system",   text: "Invoice #1082 · 3 days unpaid",                                                                delay: 200  },
      { type: "action",   text: "Payment reminder sent automatically →",                                                        delay: 700  },
      { type: "ai",       text: "Hi, just a friendly reminder that your invoice is still open. You can pay here: [link]. Let us know if anything looks off.", delay: 800 },
      { type: "note-result", text: "You get paid without having to chase it.",                                                   delay: 700  },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

// ─── Beat style helper ────────────────────────────────────────────────────────

function beatStyle(on: boolean): React.CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "translateY(0)" : "translateY(64px)",
    // "ease out expo" — fast initial movement, long graceful deceleration (Apple-style)
    transition: on
      ? "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)"
      : "none",
    willChange: "opacity, transform",
  };
}

// Each scene beat has top padding so the previous connector pushes it below the fold.
// Bottom padding is intentionally absent — the Connector component fills that gap.
function beatSlotStyle(compact = false): React.CSSProperties {
  return { paddingTop: compact ? "10vh" : "20vh" };
}

// ─── Connector ────────────────────────────────────────────────────────────────
// Animated dashed path between story beats. Appears after the card above
// it has been revealed, hinting the user to keep scrolling.

const CONNECTOR_KEYFRAMES = `
@keyframes beat-travel {
  0%   { transform: translateY(-4px); opacity: 0; }
  8%   { opacity: 1; }
  88%  { opacity: 0.9; }
  100% { transform: translateY(calc(100% + 4px)); opacity: 0; }
}
`;

function Connector({ visible, compact = false }: { visible: boolean; compact?: boolean }) {
  const h = compact ? "8vh" : "20vh";
  return (
    <div style={{
      height: h,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s ease 0.4s",
      pointerEvents: "none",
    }}>
      {/* Dashed spine */}
      <div style={{
        width: "1px",
        height: "100%",
        backgroundImage: "repeating-linear-gradient(to bottom, #C46A2E 0px, #C46A2E 5px, transparent 5px, transparent 13px)",
        opacity: 0.28,
      }} />
      {/* Traveling dot */}
      {visible && (
        <div style={{
          position: "absolute",
          top: 0,
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#C46A2E",
          boxShadow: "0 0 8px rgba(196,106,46,0.55)",
          animation: `beat-travel ${compact ? "1.4s" : "2.2s"} ease-in-out infinite`,
        }} />
      )}
      {/* Arrowhead at bottom */}
      <svg
        width="10" height="6"
        viewBox="0 0 10 6"
        style={{ position: "absolute", bottom: 0, opacity: visible ? 0.45 : 0, transition: "opacity 0.6s ease 0.4s" }}
      >
        <path d="M0 0 L5 6 L10 0" stroke="#C46A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── SceneCard ────────────────────────────────────────────────────────────────

type CardStatus = "idle" | "playing" | "done";

interface SceneCardProps {
  scene: Scene;
  jobValue: number;
  triggerPlay: boolean;
  onDone: (reward: number | null) => void;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-[#4A6B5E]/10 rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#4A6B5E]/50"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

function SceneCard({ scene, jobValue, triggerPlay, onDone }: SceneCardProps) {
  const [status, setStatus] = useState<CardStatus>("idle");
  const [revealedCount, setRevealedCount] = useState(0);
  const [typingStep, setTypingStep] = useState(-1);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cancelAll = useCallback(() => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  }, []);

  const startPlay = useCallback(() => {
    cancelAll();
    setRevealedCount(0);
    setTypingStep(-1);
    setStatus("playing");

    let elapsed = 0;
    const ids: ReturnType<typeof setTimeout>[] = [];

    scene.steps.forEach((step, idx) => {
      elapsed += step.delay;

      if (step.type === "ai") {
        const typingAt = Math.max(0, elapsed - Math.min(900, step.delay * 0.65));
        ids.push(setTimeout(() => setTypingStep(idx), typingAt));
        ids.push(setTimeout(() => {
          setTypingStep(-1);
          setRevealedCount(idx + 1);
        }, elapsed));
      } else {
        ids.push(setTimeout(() => setRevealedCount(idx + 1), elapsed));
      }
    });

    const total = elapsed + 400;
    ids.push(setTimeout(() => {
      setStatus("done");
      setTypingStep(-1);
    }, total));

    timeoutIds.current = ids;
  }, [scene, cancelAll]);

  useEffect(() => {
    if (triggerPlay && status === "idle") startPlay();
  }, [triggerPlay]);

  useEffect(() => {
    if (status === "done") onDone(scene.reward);
  }, [status]);

  useEffect(() => () => cancelAll(), [cancelAll]);

  const handleClick = () => {
    if (status === "idle" || status === "done") startPlay();
  };

  const steps = scene.steps.slice(0, revealedCount);

  return (
    <div
      className={`rounded-2xl border bg-white paper-card overflow-hidden flex flex-col transition-all duration-300 ${
        status === "done"
          ? "border-[#4A6B5E]/35 shadow-[0_4px_20px_rgba(74,107,94,0.10)]"
          : status === "playing"
          ? "border-[#C46A2E]/30 shadow-[0_4px_20px_rgba(196,106,46,0.08)]"
          : "border-[#8B8578]/25 hover:border-[#8B8578]/45"
      }`}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#8B8578]/12">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[13px] font-bold text-[#1F2A33]">{scene.time}</span>
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase"
            style={{ color: scene.tagColor }}
          >
            <span className="w-1.5 h-1.5 rounded-sm" style={{ background: scene.tagColor }} />
            {scene.tag}
          </span>
        </div>
        <div className="font-mono text-[10px] text-[#8B8578] tracking-widest uppercase mb-2">{scene.label}</div>
        <p className="text-[#6B6B60] text-sm leading-relaxed">{scene.description}</p>
      </div>

      {/* Message feed */}
      {(status === "playing" || status === "done") && (
        <div className="px-5 py-4 flex flex-col gap-2.5 flex-1">
          {steps.map((step, i) => {
            if (step.type === "system") return (
              <div key={i} className="flex items-center gap-2">
                <span className="h-px flex-1 bg-[#8B8578]/15" />
                <span className="font-mono text-[9px] text-[#8B8578] tracking-widest uppercase whitespace-nowrap">{step.text}</span>
                <span className="h-px flex-1 bg-[#8B8578]/15" />
              </div>
            );

            if (step.type === "action") return (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-[10px] text-[#8B8578]">→</span>
                <p className="font-mono text-[10px] text-[#8B8578] leading-relaxed">{step.text}</p>
              </div>
            );

            if (step.type === "customer") return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[78%] bg-white border border-[#8B8578]/20 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="text-[#6B6B60] text-xs leading-relaxed">{step.text}</p>
                </div>
              </div>
            );

            if (step.type === "ai") return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[78%] bg-[#4A6B5E]/8 border border-[#4A6B5E]/15 rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                  <p className="text-[#1F2A33] text-xs leading-relaxed font-medium">{step.text}</p>
                </div>
              </div>
            );

            if (step.type === "result") {
              const label = step.text.replace(/\s*·\s*\+\$[\d,]+$/, "") + ` · +${fmt(jobValue)}`;
              return (
                <div key={i} className="mt-1 rounded-xl bg-[#4A6B5E] px-4 py-2.5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-mono text-[11px] text-white tracking-wide">{label}</span>
                </div>
              );
            }

            if (step.type === "note-result") return (
              <div key={i} className="mt-1 rounded-xl border border-[#8B8578]/25 bg-[#F5F1E8] px-4 py-2.5">
                <p className="font-mono text-[10px] text-[#8B8578] leading-relaxed italic">{step.text}</p>
              </div>
            );

            return null;
          })}

          {/* Typing indicator */}
          {typingStep >= 0 && (
            <div className="flex justify-end">
              <TypingDots />
            </div>
          )}
        </div>
      )}

      {/* Play / Replay button */}
      <div className={`px-5 pb-5 ${status !== "idle" ? "pt-2" : "pt-5"}`}>
        {status === "idle" && (
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 bg-[#C46A2E] text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-[#B35C22] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
        )}
        {status === "playing" && (
          <div className="w-full flex items-center justify-center gap-2 text-[#8B8578] text-xs font-mono tracking-widest uppercase py-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C46A2E] animate-pulse" />
            Running
          </div>
        )}
        {status === "done" && (
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 text-[#8B8578] text-xs font-mono tracking-widest uppercase py-2 border border-[#8B8578]/20 rounded-xl hover:border-[#8B8578]/40 transition-colors"
          >
            ↺ Replay
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DayInTheLife({ pricingBase = "" }: { pricingBase?: string }) {
  const [jobValue, setJobValue] = useState(500);
  const [recovered, setRecovered] = useState(0);
  const [jobsBooked, setJobsBooked] = useState(0);
  const [playAllFrom, setPlayAllFrom] = useState<number | null>(null);
  const [playedScenes, setPlayedScenes] = useState<Set<number>>(new Set());

  // Story beat visibility — each index maps to a scene card (0-5), epilogue (6), closing (7)
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const beatRefs = useRef<(HTMLDivElement | null)[]>(Array(SCENES.length + 2).fill(null));
  // Holds the pending 5-second inter-beat pause timer so it can be cancelled on reset
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Queue-based sequential reveal
  useEffect(() => {
    const queue: number[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;

    function drain() {
      const next = queue.shift();
      if (next === undefined) { timer = null; return; }
      setVisible(prev => new Set([...prev, next]));
      timer = setTimeout(drain, 200);
    }

    function enqueue(idx: number) {
      queue.push(idx);
      if (timer === null) drain();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach(entry => {
            const idx = beatRefs.current.findIndex(el => el === entry.target);
            if (idx !== -1) {
              observer.unobserve(entry.target);
              enqueue(idx);
            }
          });
      },
      // Card fires when it's within the center band of the viewport.
      // With 20vh top+bottom padding on each slot the next card is always off-screen.
      { rootMargin: "-5% 0px -30% 0px", threshold: 0.15 }
    );

    beatRefs.current.forEach(el => { if (el) observer.observe(el); });

    return () => {
      observer.disconnect();
      if (timer !== null) clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset counters whenever the job value changes; cancel any pending advance
  useEffect(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setRecovered(0);
    setJobsBooked(0);
    setPlayedScenes(new Set());
    setPlayAllFrom(null);
  }, [jobValue]);

  // Auto-scroll during Play All: whenever playAllFrom advances to a new scene,
  // force-reveal that card and smooth-scroll it to the centre of the viewport.
  useEffect(() => {
    if (playAllFrom === null) return;
    const el = beatRefs.current[playAllFrom];
    if (!el) return;
    // Ensure the card is visible even if the user hasn't scrolled to it yet
    setVisible(prev => new Set([...prev, playAllFrom]));
    // Small delay so React flushes the reveal before we scroll
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    return () => clearTimeout(t);
  }, [playAllFrom]);

  const handleDone = useCallback((sceneId: number, reward: number | null) => {
    if (!playedScenes.has(sceneId)) {
      setPlayedScenes(prev => new Set(prev).add(sceneId));
      if (reward !== null) {
        setRecovered(r => r + jobValue);
        setJobsBooked(j => j + 1);
      }
    }
    // Wait 5 seconds so the user can absorb the completed beat before advancing
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      setPlayAllFrom(prev => {
        if (prev === sceneId && sceneId < SCENES.length - 1) return sceneId + 1;
        return null;
      });
    }, 5000);
  }, [playedScenes, jobValue]);

  const handlePlayAll = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setRecovered(0);
    setJobsBooked(0);
    setPlayedScenes(new Set());
    setPlayAllFrom(0);
  };

  const handleReset = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setRecovered(0);
    setJobsBooked(0);
    setPlayedScenes(new Set());
    setPlayAllFrom(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Job value input — always visible, no beat animation */}
      <div className="mb-8 bg-white rounded-2xl border border-[#8B8578]/20 p-6 paper-card">
        <label className="block font-mono text-[11px] text-[#4A6B5E] tracking-widest uppercase mb-3">
          What's your average job or client value?
        </label>
        <div className="flex items-center gap-5">
          <div className="flex-1 relative h-2 bg-[#E8E3D8] rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-[#C46A2E] rounded-full transition-all"
              style={{ width: `${((jobValue - 100) / 9900) * 100}%` }}
            />
            <input
              type="range"
              min={100}
              max={10000}
              step={50}
              value={jobValue}
              onChange={(e) => setJobValue(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
            />
          </div>
          <span className="font-mono text-2xl font-bold text-[#1F2A33] w-28 text-right shrink-0">
            ${jobValue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-[#8B8578] mt-2">
          <span>$100</span><span>$5,000</span><span>$10,000</span>
        </div>
        <p className="text-[#8B8578] text-xs mt-3">All counters on this page update to match your number.</p>
      </div>

      {/* Scoreboard — always visible */}
      <div className="sticky top-20 z-40 mb-10">
        <div className="bg-[#1F2A33] rounded-2xl px-6 py-4 flex items-center gap-6 md:gap-10 shadow-[0_8px_32px_rgba(31,42,51,0.20)]">
          <div className="font-mono text-[10px] text-[#F5F1E8]/40 tracking-widest uppercase hidden sm:block shrink-0">Recovered today</div>
          <div className="flex items-baseline gap-1.5 flex-1">
            <span
              className="font-mono text-3xl font-bold transition-all duration-500"
              style={{ color: recovered > 0 ? "#C46A2E" : "#F5F1E8" }}
            >
              {fmt(recovered)}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center hidden md:block">
              <div className="font-mono text-xl font-bold text-[#F5F1E8]">{jobsBooked}</div>
              <div className="font-mono text-[9px] text-[#F5F1E8]/40 tracking-widest uppercase">Jobs booked</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-1.5 bg-[#C46A2E] text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#B35C22] transition-colors whitespace-nowrap"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Play all
              </button>
              <button
                onClick={handleReset}
                className="font-mono text-[10px] text-[#F5F1E8]/50 tracking-widest uppercase px-3 py-2 rounded-lg hover:text-[#F5F1E8]/80 hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes for connector dot animation */}
      <style dangerouslySetInnerHTML={{ __html: CONNECTOR_KEYFRAMES }} />

      {/* Scene cards — each in its own slot; Connectors fill the gap between them */}
      <div className="flex flex-col max-w-2xl mx-auto">
        {SCENES.map((scene, i) => (
          <React.Fragment key={scene.id}>
            <div
              ref={(el) => { beatRefs.current[i] = el; }}
              style={{ ...beatSlotStyle(), ...beatStyle(visible.has(i)) }}
            >
              <SceneCard
                scene={scene}
                jobValue={jobValue}
                triggerPlay={playAllFrom === scene.id}
                onDone={(reward) => handleDone(scene.id, reward)}
              />
            </div>
            {/* Connector after every card — signals "keep scrolling" once the card is revealed */}
            <Connector visible={visible.has(i)} />
          </React.Fragment>
        ))}
      </div>

      {/* Epilogue — beat index 6, compact slot */}
      <div
        ref={(el) => { beatRefs.current[SCENES.length] = el; }}
        className="max-w-2xl mx-auto rounded-2xl border border-[#8B8578]/20 bg-white p-6 paper-card relative overflow-hidden"
        style={{ ...beatSlotStyle(true), ...beatStyle(visible.has(SCENES.length)) }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#4A6B5E] via-[#C46A2E] to-[#8B8578]" />
        <div className="font-mono text-[10px] text-[#8B8578] tracking-widest uppercase mb-2">A few months later</div>
        <p className="text-[#1F2A33] text-sm leading-relaxed">
          This same system brings past customers back for seasonal service automatically. No counter for this one. It's revenue that compounds quietly in the background, not something that happened today.
        </p>
      </div>

      {/* Compact connector before closing */}
      <Connector visible={visible.has(SCENES.length)} compact />

      {/* Closing — beat index 7 */}
      <div
        ref={(el) => { beatRefs.current[SCENES.length + 1] = el; }}
        className="max-w-2xl mx-auto rounded-2xl bg-[#1F2A33] p-8 md:p-12 paper-card relative overflow-hidden"
        style={{ ...beatSlotStyle(true), ...beatStyle(visible.has(SCENES.length + 1)) }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#C46A2E]" />
        <div className="font-mono text-[11px] text-[#C46A2E]/60 tracking-widest uppercase mb-2">The day's total</div>
        <div className="font-mono text-5xl md:text-6xl font-bold text-[#C46A2E] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {fmt(jobValue * 4)}
        </div>
        <div className="text-[#F5F1E8]/50 font-mono text-sm mb-8">recovered today.</div>
        <p className="text-[#F5F1E8]/75 text-sm leading-relaxed mb-5 max-w-xl">
          That doesn't even count the review that just came in, the invoice that got paid without a phone call, or the customer this same system will bring back next season.
        </p>
        <p className="text-[#F5F1E8] text-base leading-relaxed mb-10 max-w-xl">
          That's also every call you didn't have to drop everything for. Maybe that's making school pickup instead of missing it again. Maybe it's sleeping an extra thirty minutes instead of jumping on the first ring. Maybe it's just being present with the people you're actually doing this for, instead of always half-listening for the phone.
        </p>
        <a
          href={`${pricingBase}/pricing#your-numbers`}
          className="inline-flex items-center gap-2 bg-[#C46A2E] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#B35C22] hover:shadow-[0_4px_16px_rgba(196,106,46,0.4)] hover:-translate-y-px transition-all"
        >
          See exactly what this looks like for your business
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
