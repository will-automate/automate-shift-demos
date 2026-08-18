import { useState, useRef } from "react";
import {
  Zap, Sparkles, GitBranch, MessageSquare, Mail, Smartphone, Database,
  Repeat, Play, RotateCcw, FileText, Linkedin, Users, Phone, MapPin,
  Search, ArrowLeft, ChevronDown, Clock, ArrowRightCircle, Lock, Check
} from "lucide-react";

const C = {
  paper: "#F5F1E8",
  ink: "#1F2A33",
  rust: "#C46A2E",
  sage: "#4A6B5E",
  tan: "#8B8578",
};

const SOURCE_META = {
  webform: { label: "Website Form", icon: FileText },
  linkedin: { label: "LinkedIn Reply", icon: Linkedin },
  webchat: { label: "Website Chat", icon: MessageSquare },
  phone: { label: "Phone Call", icon: Phone },
  gbp: { label: "Google Business Call", icon: MapPin },
};

const CHANNEL_META = {
  slack: { label: "Slack", icon: MessageSquare },
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: Smartphone },
  crm: { label: "CRM Task", icon: Database },
};

const INDUSTRIES = {
  cybersecurity: {
    label: "Cybersecurity / MSP",
    sources: ["webform", "linkedin", "webchat", "phone"],
    avgLeadsPerMonth: 25, avgDealValue: 4200,
    leads: {
      webform: { name: "Marcus Webb", company: "Coastline Logistics", note: "Requested a risk assessment after reading about a competitor's ransomware incident." },
      linkedin: { name: "Priya Anand", company: "Anand & Wells CPA", note: "Replied to outreach: \"We don't have an internal security team, might be worth a conversation.\"" },
      webchat: { name: "Dana Ruiz", company: "Ruiz Family Dental Group", note: "Opened the website chat asking how fast you can respond to an active phishing attempt." },
      phone: { name: "Tom Baker", company: "Baker Freight Co.", note: "Called asking about compliance requirements ahead of an insurance renewal." },
    },
    hotReason: "Active security concern named, no internal team, renewal deadline creates urgency.",
    warmReason: "General interest in protection, no immediate trigger or budget timeline yet.",
    meaning: "12 hours back a week. That's enough time for two more risk assessments, or finally taking a lunch break between client calls.",
  },
  home_services: {
    label: "Home Services",
    sources: ["webform", "webchat", "phone", "gbp"],
    avgLeadsPerMonth: 60, avgDealValue: 500,
    leads: {
      webform: { name: "Karen Ellis", company: "Ellis Residence", note: "AC stopped working, submitted a same-day service request." },
      webchat: { name: "The Petersons", company: "Peterson Residence", note: "Started a website chat asking about pricing for a full furnace replacement." },
      phone: { name: "Mike Alvarez", company: "Alvarez Residence", note: "Called after hours about a water heater leak." },
      gbp: { name: "Janet Cole", company: "Cole Residence", note: "Called the number on Google Business Profile about a clogged drain." },
    },
    hotReason: "Active failure, same-day language, homeowner ready to book now.",
    warmReason: "Requesting a quote, no immediate emergency, comparing options.",
    meaning: "12 hours back a week. That's 3-4 more service calls, or actually making it home for dinner.",
  },
  septic: {
    label: "Septic & Field Services",
    sources: ["webform", "webchat", "phone"],
    avgLeadsPerMonth: 40, avgDealValue: 650,
    leads: {
      webform: { name: "Roy Fenwick", company: "Fenwick Farm", note: "Requested a quote for routine tank pumping." },
      webchat: { name: "Linda Ortiz", company: "Ortiz Property", note: "Started a website chat asking about scheduling a routine inspection." },
      phone: { name: "Greg Simmons", company: "Simmons Property", note: "Called about a backup in the drain field." },
    },
    hotReason: "Active backup reported, needs same-week service.",
    warmReason: "Routine, scheduled maintenance, flexible timing.",
    meaning: "12 hours back a week. That's an extra route's worth of jobs, or a Saturday off for once.",
  },
  professional_services: {
    label: "Legal / Professional Services",
    sources: ["webform", "linkedin", "webchat", "phone"],
    avgLeadsPerMonth: 35, avgDealValue: 2800,
    leads: {
      webform: { name: "Alan Whitfield", company: "Whitfield Holdings", note: "Requested a consultation about a contract dispute." },
      linkedin: { name: "Sara Kim", company: "Kim Ventures", note: "Replied to outreach about estate planning services." },
      webchat: { name: "The Nguyens", company: "Nguyen Family", note: "Started a website chat asking about the process for a property closing." },
      phone: { name: "Rita Alvarado", company: "Alvarado Consulting", note: "Called asking about hourly rates for a business dispute." },
    },
    hotReason: "Active dispute, time-sensitive, referred by a trusted source.",
    warmReason: "Early research phase, no active matter yet.",
    meaning: "12 hours back a week. That's another half-day of billable work, or leaving the office before dark.",
  },
};

const TIME_CHUNKS = { leadgen: 3, intake: 5, followup: 4 };
const REVENUE_SHARE = { leadgen: 0.25, intake: 0.417, followup: 0.333 };
const fmt = (n) => Math.round(n).toLocaleString("en-US");

const TIERS = {
  specialist: {
    label: "The Specialist", setup: 997, monthly: 297, roiRatio: 0.05,
    includes: { leadgen: false, intake: "partial", followup: false },
    features: [
      "Answers calls and texts around the clock",
      "Handles common customer questions automatically",
      "Books appointments straight onto your calendar",
      "Connects to one tool you already use (CRM or email)",
      "ROI dashboard access",
    ],
    employeeNote: "Includes: Intake (basic answer + booking only)",
  },
  engine: {
    label: "The Engine", setup: 2500, monthly: 750, popular: true, roiRatio: 0.1556,
    includes: { leadgen: false, intake: true, followup: true },
    features: [
      "Everything in The Specialist",
      "Full intake handling, capture through qualifying through onboarding",
      "Reaches back out to old leads who went quiet, before they book elsewhere",
      "One dashboard showing everything at a glance",
      "Connects Slack, email, and your CRM together",
      "Monthly ROI rollup emailed to you",
    ],
    employeeNote: "Includes: Intake (full) + Follow-Up",
  },
  growth: {
    label: "Growth Ops", setup: 6000, monthly: 1500, roiRatio: 0.333,
    includes: { leadgen: true, intake: true, followup: true },
    features: [
      "Everything in The Engine",
      "Finds and reaches out to brand new leads automatically",
      "Lead generation, intake, and follow-up working as one connected system",
      "Full ROI dashboard across every automation",
      "Priority support",
      "Quarterly strategy call",
      "Ongoing optimization included",
    ],
    employeeNote: "Includes: Lead Generation + Intake + Follow-Up",
  },
};

const CANVAS_W = 1000, CANVAS_H = 520;
const pct = (v, total) => `${(v / total) * 100}%`;
const centerOf = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

const NURTURE_SEQUENCE = [
  { day: "Day 0", channel: "Email", subject: "We got your message", tactic: "Immediate acknowledgment", note: "Confirms receipt, sets expectations, zero pressure." },
  { day: "Day 2", channel: "Email", subject: "How a similar company solved this", tactic: "Value-first / social proof", note: "Shares a relevant case study, builds trust indirectly." },
  { day: "Day 5", channel: "SMS", subject: "Quick check-in", tactic: "Pattern interrupt", note: "Switches channel to re-capture attention without feeling pushy." },
  { day: "Day 9", channel: "Email", subject: "Still on your radar?", tactic: "Soft urgency", note: "Reframes the cost of waiting, no hard sell." },
  { day: "Day 14", channel: "Email", subject: "Should I close your file?", tactic: "Break-up email", note: "Classic direct-response close — usually the highest reply-rate touch in the sequence." },
];

const OUTREACH_EXAMPLES = {
  cybersecurity: [
    { channel: "LinkedIn DM", tactic: "Trigger-based personalization", message: "Hi Priya — noticed Anand & Wells doesn't have an in-house security lead. With client tax data moving through your systems, worth a 15-minute look before filing season ramps up?" },
    { channel: "Email", tactic: "Timely, relevant hook", message: "Subject: Quick question about Coastline's incident response plan. Opens by referencing a recent breach in their sector, then offers a short, no-pressure risk read." },
  ],
  home_services: [
    { channel: "Email", tactic: "Seasonal + volume trigger", message: "Subject: Before your units start calling about heat. Pitches a priority maintenance agreement to a property manager ahead of the first cold snap." },
    { channel: "SMS", tactic: "Warm intro leverage", message: "Hi Mrs. Peterson, this is [Company] — your neighbor recommended we reach out about your furnace before winter. Free estimate this week?" },
  ],
  septic: [
    { channel: "Email", tactic: "Compliance deadline trigger", message: "Subject: Your inspection window opens next month. References the public permit record showing their property is due, offers to get ahead of the deadline." },
    { channel: "Postcard + follow-up call", tactic: "Routine + convenience framing", message: "Reminds a rural property owner it's been the standard interval since their last pump-out, with a simple one-call booking option." },
  ],
  professional_services: [
    { channel: "LinkedIn DM", tactic: "Business-event trigger + question hook", message: "Saw the news about your expansion into a second location. Curious whether your current lease and vendor contracts have been reviewed for the new site?" },
    { channel: "Email", tactic: "Warm referral leverage", message: "Subject: [Referrer] suggested I reach out. Opens by naming the mutual connection, then a single, specific ask tied to their situation." },
  ],
};

const BENCHMARKS = [
  { metric: "Cold email reply rate", range: "3–5% average, 8%+ on tightly targeted lists" },
  { metric: "LinkedIn outreach reply rate", range: "~10% average, 18–25%+ with strong personalization" },
  { metric: "Meetings booked per 100 outbound touches", range: "1–2 on cold email alone, higher on multichannel sequences" },
  { metric: "Multichannel lift (email + LinkedIn combined)", range: "2–3x more replies than either channel run alone" },
];

function routeMessage(channel, lead, reengaged) {
  if (reengaged) {
    switch (channel) {
      case "slack": return { kind: "slack", channel: "#new-leads", text: `🌱 Re-engaged: ${lead.name} (${lead.company}) just replied to the nurture sequence. ${lead.note} — Already introduced, skip the cold open and reference the earlier conversation.` };
      case "email": return { kind: "email", to: "sales@yourcompany.com", subject: `Re-engaged: ${lead.company} replied`, body: `${lead.name} from ${lead.company} responded after being in the nurture sequence.\n\n${lead.note}\n\nThey've already had a prior touch, no cold intro needed. Reference the earlier conversation and pick up where it left off.` };
      case "sms": return { kind: "sms", text: `Re-engaged lead: ${lead.name} (${lead.company}) replied after follow-up. Reference the prior conversation, don't restart from scratch.` };
      case "crm": return { kind: "crm", text: `Task created — ${lead.name} (${lead.company}) re-engaged after nurture. Priority: High. Note: Reference prior touchpoints, do not repeat the intro script.` };
      default: return null;
    }
  }
  switch (channel) {
    case "slack": return { kind: "slack", channel: "#new-leads", text: `🔥 Hot lead: ${lead.name} (${lead.company}). ${lead.note} — Score 87. Assigned to sales queue.` };
    case "email": return { kind: "email", to: "sales@yourcompany.com", subject: `Hot Lead: ${lead.company}`, body: `${lead.name} from ${lead.company} just came in as a hot lead.\n\n${lead.note}\n\nScore: 87/100. Recommend contacting within 5 minutes.` };
    case "sms": return { kind: "sms", text: `New hot lead: ${lead.name} (${lead.company}). Call within 5 min for best odds of closing.` };
    case "crm": return { kind: "crm", text: `Task created — Follow up with ${lead.name} (${lead.company}). Priority: High. Due: Now.` };
    default: return null;
  }
}

function StatCallout({ before, after, label }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: "#FFF3EA" }}>
      <div className="text-xs font-semibold" style={{ color: C.tan }}>{label}</div>
      <div className="flex items-center gap-2 ml-auto text-sm font-bold">
        <span style={{ color: C.rust }}>{before}</span>
        <ArrowRightCircle size={14} style={{ color: C.tan }} />
        <span style={{ color: C.sage }}>{after}</span>
      </div>
    </div>
  );
}

function NodeBox({ id, node, label, Icon, accent, active, selected, dashed, onClick, badge, locked }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        position: "absolute",
        left: pct(node.x, CANVAS_W), top: pct(node.y, CANVAS_H),
        width: pct(node.w, CANVAS_W), height: pct(node.h, CANVAS_H),
        background: locked ? "#EDEAE2" : "#FFFFFF",
        border: `2px ${dashed ? "dashed" : "solid"} ${selected ? C.rust : active ? accent : "#3A4753"}`,
        boxShadow: selected ? `0 0 0 3px ${C.rust}33` : active ? `0 0 14px ${accent}55` : "none",
        opacity: locked ? 0.55 : 1,
      }}
      className="rounded-xl p-3 text-left flex flex-col justify-between transition-all relative"
    >
      {locked && <Lock size={13} className="absolute top-2 right-2" style={{ color: C.tan }} />}
      <div className="flex items-center gap-2">
        <div style={{ background: accent }} className="p-1.5 rounded-md flex-shrink-0">
          <Icon size={16} color="#fff" />
        </div>
        <span className="font-bold text-xs md:text-sm leading-tight" style={{ color: C.ink }}>{label}</span>
      </div>
      {badge && <div className="text-[10px] md:text-xs font-medium mt-1" style={{ color: C.tan }}>{badge}</div>}
    </button>
  );
}

export default function GrowthOpsSimulator() {
  const partnerMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("partner");
  const [industryKey, setIndustryKey] = useState("cybersecurity");
  const industry = INDUSTRIES[industryKey];

  const [source, setSource] = useState(industry.sources[0]);
  const [leadsPerMonth, setLeadsPerMonth] = useState(industry.avgLeadsPerMonth);
  const [dealValue, setDealValue] = useState(industry.avgDealValue);
  const [channel, setChannel] = useState("slack");
  const [branch, setBranch] = useState("hot");
  const [tier, setTier] = useState("growth");
  const [reengaged, setReengaged] = useState(false);
  const [preRevenue, setPreRevenue] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [view, setView] = useState("overview"); // overview | leadgen | intake | followup
  const [openNode, setOpenNode] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef([]);

  const lead = industry.leads[source];

  const stopRun = () => { timers.current.forEach(clearTimeout); timers.current = []; setRunning(false); };

  const goView = (v, opts = {}) => {
    stopRun(); setView(v); setOpenNode(null); setStepIdx(0);
    setReengaged(!!opts.reengaged);
    if (opts.reengaged) setBranch("hot");
  };

  const changeIndustry = (key) => {
    setIndustryKey(key);
    setSource(INDUSTRIES[key].sources[0]);
    setLeadsPerMonth(INDUSTRIES[key].avgLeadsPerMonth);
    setDealValue(INDUSTRIES[key].avgDealValue);
    goView("overview");
  };

  // Per-view flow definitions
  function getFlow() {
    if (view === "overview") {
      return {
        sequence: ["leadgen", "intake", "followup"],
        nodes: {
          leadgen: { x: 30, y: 200, w: 260, h: 110, label: "Lead Generation", Icon: Search, accent: C.sage, badge: "Finds new leads automatically", locked: TIERS[tier].includes.leadgen === false },
          intake: { x: 390, y: 200, w: 260, h: 110, label: "Intake", Icon: Zap, accent: C.tan, badge: TIERS[tier].includes.intake === "partial" ? "Basic answer + booking only" : "Captures, qualifies, routes" },
          followup: { x: 750, y: 200, w: 260, h: 110, label: "Follow-Up", Icon: Repeat, accent: C.rust, badge: "Re-engages until they respond", locked: TIERS[tier].includes.followup === false },
        },
        edges: [
          { from: "leadgen", to: "intake", activeIdx: 2 },
          { from: "intake", to: "followup", activeIdx: 3 },
        ],
        feedback: { from: "followup", to: "intake", label: "re-engaged leads route back on their own path" },
      };
    }
    if (view === "leadgen") {
      return {
        sequence: ["identify", "personalize", "send", "handoff"],
        nodes: {
          identify: { x: 20, y: 205, w: 190, h: 100, label: "Identify Prospects", Icon: Search, accent: C.sage, badge: SOURCE_META[source]?.label || "Prospect scan" },
          personalize: { x: 260, y: 205, w: 190, h: 100, label: "Personalize Outreach", Icon: Sparkles, accent: C.tan, badge: "AI-drafted, per-prospect" },
          send: { x: 500, y: 205, w: 190, h: 100, label: "Send & Track", Icon: Mail, accent: C.tan, badge: "Multi-channel" },
          handoff: { x: 740, y: 205, w: 240, h: 100, label: "Hands to Intake", Icon: ArrowRightCircle, accent: C.ink, badge: "On reply", dashed: true },
        },
        edges: [
          { from: "identify", to: "personalize", activeIdx: 2 },
          { from: "personalize", to: "send", activeIdx: 3 },
          { from: "send", to: "handoff", activeIdx: 4 },
        ],
      };
    }
    if (view === "intake") {
      return {
        sequence: ["capture", "qualify", "routeDecision", branch === "hot" ? "routeTo" : "handoffFollowup"],
        nodes: {
          capture: { x: 10, y: 205, w: 170, h: 100, label: "Capture Lead", Icon: Zap, accent: C.sage, badge: SOURCE_META[source]?.label },
          qualify: { x: 230, y: 205, w: 160, h: 100, label: "AI Qualify", Icon: Sparkles, accent: C.tan, badge: branch === "hot" ? "Score 87 · Hot" : "Score 54 · Warm" },
          routeDecision: { x: 440, y: 205, w: 150, h: 100, label: "Route Decision", Icon: GitBranch, accent: C.ink, badge: branch === "hot" ? "→ Team, now" : "→ Follow-Up" },
          routeTo: { x: 650, y: 55, w: 190, h: 100, label: reengaged ? "Route To (Re-engaged)" : "Route To", Icon: CHANNEL_META[channel].icon, accent: C.rust, badge: reengaged ? `${CHANNEL_META[channel].label} · distinct script` : CHANNEL_META[channel].label },
          handoffFollowup: { x: 650, y: 355, w: 210, h: 100, label: "Hands to Follow-Up", Icon: ArrowRightCircle, accent: C.ink, badge: "Not ready yet", dashed: true },
        },
        edges: [
          { from: "capture", to: "qualify", activeIdx: 2 },
          { from: "qualify", to: "routeDecision", activeIdx: 3 },
          { from: "routeDecision", to: "routeTo", activeIdx: 4, onlyIf: () => branch === "hot" },
          { from: "routeDecision", to: "handoffFollowup", activeIdx: 4, onlyIf: () => branch === "warm" },
        ],
      };
    }
    // followup
    return {
      sequence: ["segment", "sequence", "detect", "handoffIntake"],
      nodes: {
        segment: { x: 20, y: 205, w: 180, h: 100, label: "Segment Quiet Leads", Icon: GitBranch, accent: C.sage, badge: "By reason & timing" },
        sequence: { x: 240, y: 190, w: 240, h: 130, label: "Multi-Touch Sequence", Icon: Repeat, accent: C.rust, badge: "5 touches, 14 days" },
        detect: { x: 520, y: 205, w: 180, h: 100, label: "Detect Engagement", Icon: Sparkles, accent: C.tan, badge: "Any reply or click" },
        handoffIntake: { x: 750, y: 205, w: 230, h: 100, label: "Hands to Intake", Icon: ArrowRightCircle, accent: C.ink, badge: "Distinct re-engagement path", dashed: true },
      },
      edges: [
        { from: "segment", to: "sequence", activeIdx: 2 },
        { from: "sequence", to: "detect", activeIdx: 3 },
        { from: "detect", to: "handoffIntake", activeIdx: 4 },
      ],
    };
  }

  const flow = getFlow();

  const selectNode = (id) => {
    stopRun();
    setOpenNode((cur) => (cur === id ? null : id));
    const idx = flow.sequence.indexOf(id);
    if (idx >= 0) setStepIdx(idx + 1);
  };

  const runFlow = () => {
    stopRun();
    setRunning(true);
    setStepIdx(0);
    setOpenNode(null);
    flow.sequence.forEach((nodeId, i) => {
      const t = setTimeout(() => {
        setOpenNode(nodeId);
        setStepIdx(i + 1);
        if (i === flow.sequence.length - 1) setRunning(false);
      }, (i + 1) * 1500);
      timers.current.push(t);
    });
  };

  const reset = () => { stopRun(); setOpenNode(null); setStepIdx(0); };

  const isActive = (id) => flow.sequence.indexOf(id) < stepIdx;
  const viewLockedTier = view === "leadgen" && TIERS[tier].includes.leadgen === false ? "growth"
    : view === "followup" && TIERS[tier].includes.followup === false ? "engine"
    : null;

  const pipelineValue = leadsPerMonth * dealValue;
  const lostValue = pipelineValue * 0.30;
  const recovered = (tk) => lostValue * TIERS[tk].roiRatio;
  const netMonthly = (tk) => recovered(tk) - TIERS[tk].monthly;
  const revenueFor = (id) => recovered(tier) * (REVENUE_SHARE[id] || 0);
  const timeSaved = view === "overview"
    ? flow.sequence.slice(0, stepIdx).reduce((s, id) => s + (TIME_CHUNKS[id] || 0), 0)
    : 0;
  const timeValueMonthly = timeSaved * hourlyRate * 4.33;

  return (
    <div style={{ background: C.paper, color: C.ink, fontFamily: "'Helvetica Neue', Arial, sans-serif" }} className="w-full min-h-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: C.rust }}>
              {partnerMode ? "Growth Ops" : "Automate Shift — Growth Ops"}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {view === "overview" ? "Your Digital Employees" : flow.nodes && view === "leadgen" ? "Lead Generation, opened up" : view === "intake" ? "Intake, opened up" : "Follow-Up, opened up"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {view !== "overview" && (
              <button onClick={() => goView("overview")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border-2" style={{ borderColor: C.ink, color: C.ink }}>
                <ArrowLeft size={14} /> All employees
              </button>
            )}
            <div className="relative">
              <select value={industryKey} onChange={(e) => changeIndustry(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border-2 text-sm font-semibold cursor-pointer"
                style={{ borderColor: C.ink, background: "#fff", color: C.ink }}>
                {Object.entries(INDUSTRIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button onClick={runFlow} disabled={running}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: C.rust, color: "#fff", opacity: running ? 0.6 : 1 }}>
              <Play size={14} /> Run
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border-2" style={{ borderColor: C.tan, color: C.ink }}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
        {view !== "overview" && (
          <p className="text-sm mb-3" style={{ color: C.tan }}>
            Every box here is a working component today, already built and already running for other clients.
          </p>
        )}

        {view === "overview" && (
          <div className="mb-3 p-4 rounded-lg" style={{ background: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.tan }}>
                {preRevenue ? "Your target numbers" : "Your numbers"}
              </span>
              <button onClick={() => setPreRevenue((p) => !p)} className="text-xs font-bold underline" style={{ color: C.sage }}>
                {preRevenue ? "Switch back to revenue view" : "Pre-revenue? Use opportunity-cost view"}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{preRevenue ? "Expected monthly leads (target market est.)" : "Monthly leads/inquiries"}</span>
                  <span style={{ color: C.rust }} className="font-bold">{fmt(leadsPerMonth)}</span>
                </div>
                <input type="range" min="5" max="300" value={leadsPerMonth}
                  onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                  className="w-full" style={{ accentColor: C.rust }} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{preRevenue ? "Target price per deal/plan" : "Avg. deal / ticket value"}</span>
                  <span style={{ color: C.rust }} className="font-bold">${fmt(dealValue)}</span>
                </div>
                <input type="range" min="100" max="10000" step="50" value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full" style={{ accentColor: C.rust }} />
              </div>
              {preRevenue && (
                <div className="md:col-span-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Value of your time ($/hr)</span>
                    <span style={{ color: C.rust }} className="font-bold">${fmt(hourlyRate)}/hr</span>
                  </div>
                  <input type="range" min="25" max="250" step="5" value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full" style={{ accentColor: C.rust }} />
                </div>
              )}
            </div>
            {preRevenue && (
              <p className="text-xs mt-3" style={{ color: C.tan }}>
                No revenue history yet, so the dollar figures below are projections based on your target pricing, not a track record. Hours saved are the more certain number, since they're real whether or not a deal has closed.
              </p>
            )}
          </div>
        )}

        {viewLockedTier && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-lg text-sm" style={{ background: "#FFF3EA" }}>
            <Lock size={16} style={{ color: C.rust }} />
            <span>You're viewing this at <strong>{TIERS[tier].label}</strong>, where it isn't included. This workflow ships starting at <strong>{TIERS[viewLockedTier].label}</strong>.</span>
            <button onClick={() => setTier(viewLockedTier)} className="ml-auto font-bold underline whitespace-nowrap" style={{ color: C.rust }}>Switch tier</button>
          </div>
        )}

        {view === "intake" && reengaged && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-lg text-sm" style={{ background: "#EAF0EC" }}>
            <Repeat size={16} style={{ color: C.sage }} />
            <span>Arriving from Follow-Up, not a brand-new lead. Route To uses a distinct re-engagement script.</span>
            <button onClick={() => goView("intake")} className="ml-auto font-bold underline whitespace-nowrap" style={{ color: C.sage }}>View as fresh hot lead instead</button>
          </div>
        )}

        {/* Time saved + revenue/time-value counter — overview only */}
        {view === "overview" && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: C.ink, color: C.paper }}>
            <div className="flex items-center gap-2">
              <Clock size={20} color={C.rust} />
              <span className="font-bold text-lg">{timeSaved} hrs/week</span>
            </div>
            <span className="text-xs" style={{ color: C.tan }}>saved so far</span>
            <div className="flex items-center gap-2 border-l pl-3" style={{ borderColor: "#3A4753" }}>
              <span className="font-bold text-lg" style={{ color: "#8FD9B6" }}>
                ${fmt(preRevenue ? (stepIdx >= 3 ? timeValueMonthly : (timeValueMonthly * stepIdx) / 3) : (stepIdx >= 3 ? recovered(tier) : (recovered(tier) * stepIdx) / 3))}/mo
              </span>
            </div>
            <span className="text-xs" style={{ color: C.tan }}>
              {preRevenue ? "value of hours reclaimed, at your own rate" : `recovered at ${TIERS[tier].label}`}
            </span>
            {stepIdx >= 3 && (
              <span className="ml-auto text-sm font-medium" style={{ color: "#fff" }}>{industry.meaning}</span>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className="relative w-full rounded-xl overflow-hidden mb-4"
          style={{ background: C.ink, aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, backgroundImage: "radial-gradient(circle, rgba(245,241,232,0.14) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
          <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {flow.edges.map((e, i) => {
              const from = centerOf(flow.nodes[e.from]);
              const to = centerOf(flow.nodes[e.to]);
              const active = stepIdx >= e.activeIdx && (!e.onlyIf || e.onlyIf());
              const dimmed = e.onlyIf ? !e.onlyIf() : false;
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={active ? C.rust : "#3A4753"} strokeOpacity={dimmed ? 0.3 : 1}
                  strokeWidth="3" markerEnd="url(#arrow)" />
              );
            })}
            {flow.feedback && (
              <>
                <path
                  d={`M ${flow.nodes[flow.feedback.from].x + flow.nodes[flow.feedback.from].w / 2} ${flow.nodes[flow.feedback.from].y}
                      C ${flow.nodes[flow.feedback.from].x} ${flow.nodes[flow.feedback.from].y - 60},
                        ${flow.nodes[flow.feedback.to].x + flow.nodes[flow.feedback.to].w / 2} ${flow.nodes[flow.feedback.to].y + flow.nodes[flow.feedback.to].h + 60},
                        ${flow.nodes[flow.feedback.to].x + flow.nodes[flow.feedback.to].w / 2} ${flow.nodes[flow.feedback.to].y + flow.nodes[flow.feedback.to].h}`}
                  fill="none" stroke={C.sage} strokeWidth="2" strokeDasharray="6 6" opacity="0.8" markerEnd="url(#arrowSage)"
                />
                <text x={flow.nodes[flow.feedback.to].x} y={flow.nodes[flow.feedback.to].y + flow.nodes[flow.feedback.to].h + 90}
                  fill={C.sage} fontSize="12" fontWeight="600">{flow.feedback.label}</text>
              </>
            )}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={C.rust} /></marker>
              <marker id="arrowSage" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={C.sage} /></marker>
            </defs>
          </svg>

          {Object.entries(flow.nodes).map(([id, n]) => (
            <NodeBox key={id} id={id} node={n} label={n.label} Icon={n.Icon} accent={n.accent}
              active={isActive(id)} selected={openNode === id} dashed={n.dashed} locked={n.locked}
              onClick={selectNode} badge={n.badge} />
          ))}
        </div>

        {/* Inspector */}
        <div className="rounded-xl p-5 min-h-[220px]" style={{ background: "#FFFFFF" }}>
          {!openNode && (
            <p className="text-sm" style={{ color: C.tan }}>
              {view === "overview" ? "Click a digital employee to see what it does, or hit Run to watch the whole handoff." : "Click a node to see what it does under the hood."}
            </p>
          )}

          {/* OVERVIEW inspectors */}
          {view === "overview" && openNode === "leadgen" && (
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">Lead Generation {TIERS[tier].includes.leadgen === false && <Lock size={14} style={{ color: C.tan }} />}</h3>
              <p className="text-sm mb-3">Finds companies matching your ideal customer profile and starts a personalized outreach sequence automatically, before they ever fill out a form.</p>
              <StatCallout label="Time this replaces" before="3 hrs/week manual prospecting" after="automatic" />
              <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: "#EAF0EC" }}>
                <span className="text-xs font-semibold" style={{ color: C.tan }}>Revenue attributable</span>
                <span className="ml-auto text-sm font-bold" style={{ color: C.sage }}>${fmt(revenueFor("leadgen"))}/mo</span>
              </div>
              {TIERS[tier].includes.leadgen === false ? (
                <p className="text-sm font-semibold" style={{ color: C.rust }}>Included starting at Growth Ops. <button onClick={() => setTier("growth")} className="underline">Switch tier to see it →</button></p>
              ) : (
                <button onClick={() => goView("leadgen")} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.sage, color: "#fff" }}>Open this workflow →</button>
              )}
            </div>
          )}
          {view === "overview" && openNode === "intake" && (
            <div>
              <h3 className="font-bold mb-2">Intake</h3>
              <p className="text-sm mb-3">Captures every lead the moment it arrives, scores it, and routes it to the right place, day or night.</p>
              <StatCallout label="Response time" before="42 hrs" after="< 5 min" />
              <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: "#EAF0EC" }}>
                <span className="text-xs font-semibold" style={{ color: C.tan }}>Revenue attributable</span>
                <span className="ml-auto text-sm font-bold" style={{ color: C.sage }}>${fmt(revenueFor("intake"))}/mo</span>
              </div>
              {TIERS[tier].includes.intake === "partial" && (
                <p className="text-sm font-semibold mb-3" style={{ color: C.rust }}>At The Specialist, this is answer + booking only. Qualifying, routing, and channel choice unlock at The Engine.</p>
              )}
              <button onClick={() => goView("intake")} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.tan, color: "#fff" }}>Open this workflow →</button>
            </div>
          )}
          {view === "overview" && openNode === "followup" && (
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">Follow-Up {TIERS[tier].includes.followup === false && <Lock size={14} style={{ color: C.tan }} />}</h3>
              <p className="text-sm mb-3">Keeps working leads that went quiet, with a real sequence, not a single forgotten email.</p>
              <StatCallout label="Leads who get a real follow-up" before="27%" after="100%" />
              <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: "#EAF0EC" }}>
                <span className="text-xs font-semibold" style={{ color: C.tan }}>Revenue attributable</span>
                <span className="ml-auto text-sm font-bold" style={{ color: C.sage }}>${fmt(revenueFor("followup"))}/mo</span>
              </div>
              {TIERS[tier].includes.followup === false ? (
                <p className="text-sm font-semibold" style={{ color: C.rust }}>Included starting at The Engine. <button onClick={() => setTier("engine")} className="underline">Switch tier to see it →</button></p>
              ) : (
                <button onClick={() => goView("followup")} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.rust, color: "#fff" }}>Open this workflow →</button>
              )}
            </div>
          )}

          {/* LEAD GEN inspectors */}
          {view === "leadgen" && openNode === "identify" && (
            <div>
              <h3 className="font-bold mb-2">Identify Prospects</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {industry.sources.map((s) => { const M = SOURCE_META[s]; return (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: source === s ? C.sage : C.paper, color: source === s ? "#fff" : C.ink }} onClick={() => setSource(s)}>
                    <M.icon size={13} /> {M.label}
                  </div>
                ); })}
              </div>
              <StatCallout label="Time this replaces" before="3 hrs/week" after="automatic" />
              <p className="text-sm">Currently scanning for prospects matching {industry.label.toLowerCase()} ICP criteria.</p>
            </div>
          )}
          {view === "leadgen" && openNode === "personalize" && (
            <div>
              <h3 className="font-bold mb-2">Personalize Outreach</h3>
              <p className="text-sm mb-3">Claude drafts a first-touch message referencing something specific to the prospect, their industry, recent activity, or a shared connection, instead of a generic template.</p>
              <div className="space-y-2">
                {(OUTREACH_EXAMPLES[industryKey] || []).map((ex, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: C.paper }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.ink, color: "#fff" }}>{ex.channel}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.sage, color: "#fff" }}>{ex.tactic}</span>
                    </div>
                    <p className="text-sm">{ex.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === "leadgen" && openNode === "send" && (
            <div>
              <h3 className="font-bold mb-3">Send & Track</h3>
              <p className="text-sm mb-3">Sends across the right channel for the industry and logs every open, click, and reply so nothing needs to be checked manually.</p>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.rust }}>What to expect (industry benchmarks, not a case study)</p>
              <div className="space-y-1.5 mb-2">
                {BENCHMARKS.map((b) => (
                  <div key={b.metric} className="flex items-center justify-between gap-3 p-2 rounded-lg text-sm" style={{ background: C.paper }}>
                    <span className="font-medium">{b.metric}</span>
                    <span className="font-bold text-right" style={{ color: C.sage }}>{b.range}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: C.tan }}>General 2026 B2B outbound benchmarks (Instantly, Apollo, Belkins). Actual performance depends on list quality, offer, and how time-sensitive the trigger is.</p>
            </div>
          )}
          {view === "leadgen" && openNode === "handoff" && (
            <div>
              <h3 className="font-bold mb-2">Hands to Intake</h3>
              <p className="text-sm mb-3">The moment someone replies, it's captured and handed straight into Intake for qualification, no copy-paste, no delay.</p>
              <button onClick={() => goView("intake")} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.ink, color: "#fff" }}>Open Intake workflow →</button>
            </div>
          )}

          {/* INTAKE inspectors */}
          {view === "intake" && openNode === "capture" && (
            <div>
              <h3 className="font-bold mb-2">Capture Lead</h3>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.sage }}>Active channels</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {industry.sources.map((s) => { const M = SOURCE_META[s]; return (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer" style={{ background: source === s ? C.sage : C.paper, color: source === s ? "#fff" : C.ink }} onClick={() => setSource(s)}>
                    <M.icon size={13} /> {M.label}
                  </div>
                ); })}
              </div>
              <StatCallout label="Response time" before="42 hrs" after="< 5 min" />
              <div className="p-3 rounded-lg" style={{ background: C.paper }}>
                <p className="font-bold text-sm">{lead.name} — {lead.company}</p>
                <p className="text-sm mt-1">{lead.note}</p>
              </div>
            </div>
          )}
          {view === "intake" && openNode === "qualify" && (
            <div>
              <h3 className="font-bold mb-2">AI Qualify</h3>
              <div className="px-3 py-1.5 rounded-full font-bold text-sm inline-block mb-3" style={{ background: branch === "hot" ? "#FFE3D1" : "#EAF0EC", color: branch === "hot" ? C.rust : C.sage }}>
                {branch === "hot" ? "Score 87 — Hot" : "Score 54 — Warm"}
              </div>
              <p className="text-sm">{branch === "hot" ? industry.hotReason : industry.warmReason}</p>
            </div>
          )}
          {view === "intake" && openNode === "routeDecision" && (
            <div>
              <h3 className="font-bold mb-3">Route Decision</h3>
              <StatCallout label="Conversion drop after a 5-min delay" before="78%" after="0%" />
              <p className="text-sm mb-3">Toggle to see both paths a lead can take from here.</p>
              <div className="flex gap-2">
                <button onClick={() => setBranch("hot")} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: branch === "hot" ? C.rust : "transparent", color: branch === "hot" ? "#fff" : C.ink, border: `2px solid ${C.rust}` }}>Hot lead</button>
                <button onClick={() => setBranch("warm")} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: branch === "warm" ? C.sage : "transparent", color: branch === "warm" ? "#fff" : C.ink, border: `2px solid ${C.sage}` }}>Warm lead</button>
              </div>
            </div>
          )}
          {view === "intake" && openNode === "routeTo" && (
            <div>
              <h3 className="font-bold mb-2">Route To</h3>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.rust }}>{reengaged ? "Routing re-engaged leads to" : "Routing hot leads to"}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(CHANNEL_META).map(([k, M]) => (
                  <div key={k} onClick={() => setChannel(k)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer" style={{ background: channel === k ? C.rust : C.paper, color: channel === k ? "#fff" : C.ink }}>
                    <M.icon size={13} /> {M.label}
                  </div>
                ))}
              </div>
              {reengaged && (
                <p className="text-xs mb-2" style={{ color: C.sage }}>This is a separate script from a fresh hot lead, it references the prior conversation instead of opening cold.</p>
              )}
              <ChannelPreview msg={routeMessage(channel, lead, reengaged)} />
            </div>
          )}
          {view === "intake" && openNode === "handoffFollowup" && (
            <div>
              <h3 className="font-bold mb-2">Hands to Follow-Up</h3>
              <p className="text-sm mb-3">Not ready yet doesn't mean lost. This lead moves straight into the Follow-Up sequence automatically.</p>
              <button onClick={() => goView("followup")} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.ink, color: "#fff" }}>Open Follow-Up workflow →</button>
            </div>
          )}

          {/* FOLLOW-UP inspectors */}
          {view === "followup" && openNode === "segment" && (
            <div>
              <h3 className="font-bold mb-2">Segment Quiet Leads</h3>
              <p className="text-sm">Groups leads by why they went quiet, no response, quoted but didn't book, engaged then stalled, so the right sequence and timing applies to each.</p>
            </div>
          )}
          {view === "followup" && openNode === "sequence" && (
            <div>
              <h3 className="font-bold mb-3">Multi-Touch Sequence</h3>
              <StatCallout label="Leads who get a real follow-up" before="27%" after="100%" />
              <div className="space-y-2">
                {NURTURE_SEQUENCE.map((step) => (
                  <div key={step.day} className="flex items-start gap-3 p-2 rounded-lg" style={{ background: C.paper }}>
                    <span className="text-xs font-bold px-2 py-1 rounded flex-shrink-0" style={{ background: C.ink, color: "#fff" }}>{step.day}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">"{step.subject}"</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.sage, color: "#fff" }}>{step.tactic}</span>
                        <span className="text-[10px]" style={{ color: C.tan }}>{step.channel}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: C.tan }}>{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: C.tan }}>Sequence stops the instant they reply or book, no double-messaging.</p>
            </div>
          )}
          {view === "followup" && openNode === "detect" && (
            <div>
              <h3 className="font-bold mb-2">Detect Engagement</h3>
              <p className="text-sm">Watches for any reply, click, or booking across the whole sequence, in real time, not on a manual check-in schedule.</p>
            </div>
          )}
          {view === "followup" && openNode === "handoffIntake" && (
            <div>
              <h3 className="font-bold mb-2">Hands to Intake</h3>
              <p className="text-sm mb-3">A reply here means the lead is warm again, right now, but they're not a cold hot-lead script rerun. They route back into Intake's Route Decision on a distinct re-engagement path, same speed, same channel, but the message references the prior conversation instead of opening cold.</p>
              <StatCallout label="Time this replaces" before="4 hrs/week manual re-engagement" after="automatic" />
              <button onClick={() => goView("intake", { reengaged: true })} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.ink, color: "#fff" }}>Open Intake workflow →</button>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl overflow-hidden" style={{ background: "#FFFFFF" }}>
          <div className="flex" style={{ background: C.ink }}>
            {Object.entries(TIERS).map(([k, t]) => (
              <button key={k} onClick={() => setTier(k)}
                className="flex-1 py-3 px-3 text-sm font-bold relative"
                style={{ background: tier === k ? C.paper : "transparent", color: tier === k ? C.ink : "#fff" }}>
                {t.popular && <span className="absolute -top-0.5 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-b" style={{ background: C.rust, color: "#fff" }}>Most Popular</span>}
                {t.label}
                <div className="text-xs font-normal" style={{ color: tier === k ? C.tan : "#B8BEC4" }}>${t.setup.toLocaleString()} + ${t.monthly}/mo</div>
              </button>
            ))}
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.rust }}>{TIERS[tier].employeeNote}</p>
            <div className="grid grid-cols-3 gap-3 mb-2 p-3 rounded-lg" style={{ background: C.paper }}>
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: C.tan }}>{preRevenue ? "Projected recovers" : "Recovers"}</p>
                <p className="font-bold" style={{ color: C.sage }}>${fmt(recovered(tier))}/mo</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: C.tan }}>Net after cost</p>
                <p className="font-bold" style={{ color: netMonthly(tier) >= 0 ? C.sage : C.rust }}>{netMonthly(tier) >= 0 ? "+" : ""}${fmt(netMonthly(tier))}/mo</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: C.tan }}>Annualized</p>
                <p className="font-bold" style={{ color: C.ink }}>${fmt(netMonthly(tier) * 12)}</p>
              </div>
            </div>
            {preRevenue && (
              <p className="text-xs mb-3" style={{ color: C.tan }}>Projected off your target pricing, not historical revenue, since there's no track record yet.</p>
            )}
            <ul className="space-y-1.5">
              {TIERS[tier].features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: C.sage }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelPreview({ msg }) {
  if (!msg) return null;
  if (msg.kind === "slack") return (
    <div className="rounded-lg p-3 max-w-md" style={{ background: "#3F0E40", color: "#fff" }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: C.rust }}>AS</div>
        <span className="font-bold text-sm">{partnerMode ? "Automation Bot" : "Automate Shift Bot"}</span>
        <span className="text-xs opacity-60">{msg.channel}</span>
      </div>
      <p className="text-sm">{msg.text}</p>
    </div>
  );
  if (msg.kind === "email") return (
    <div className="rounded-lg border p-3 max-w-md bg-white" style={{ borderColor: C.tan }}>
      <p className="text-xs" style={{ color: C.tan }}>To: {msg.to}</p>
      <p className="text-sm font-bold mt-1">{msg.subject}</p>
      <p className="text-sm mt-2 whitespace-pre-line">{msg.body}</p>
    </div>
  );
  if (msg.kind === "sms") return (
    <div className="rounded-2xl px-4 py-2 max-w-xs text-sm" style={{ background: C.sage, color: "#fff" }}>{msg.text}</div>
  );
  return (
    <div className="rounded-lg border-2 border-dashed p-3 max-w-md" style={{ borderColor: C.tan }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.tan }}>CRM Task Created</p>
      <p className="text-sm">{msg.text}</p>
    </div>
  );
}
