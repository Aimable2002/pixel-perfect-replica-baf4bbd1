// All mock data for Kaliza. Delete this file once api.ts talks to the real backend.
import brunch from "@/assets/bistro-brunch.jpg";
import type {
  ActivityItem, AgentMessage, AgentSuggestion, AnalyticsPoint, Campaign, Conversation,
  DashboardMetric, Lead, MediaItem, Post, TeamMember, ConnectedAccount,
  AdminPricing, PricingCatalog, PromoCode, ResourceCost, UsageSnapshot,
} from "./types";

const day = (offset: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const mockMetrics: DashboardMetric[] = [
  { id: "reach", label: "Reach (7d)", value: "48.2K", change: 12.4 },
  { id: "engagement", label: "Engagement rate", value: "5.8%", change: 0.9 },
  { id: "leads", label: "Qualified leads", value: "37", change: 22.0 },
  { id: "roas", label: "Ad ROAS", value: "3.4x", change: -4.1 },
];

export const mockActivity: ActivityItem[] = [
  { id: "a1", type: "reply", text: "Replied to 14 comments on “Summer menu launch”", time: day(0, 9) },
  { id: "a2", type: "lead", text: "Qualified Aline M. as a hot lead from DM (catering, 80 guests)", time: day(0, 8) },
  { id: "a3", type: "ad", text: "Paused ad “Brunch Carousel B” — CPC 2.3x above set average", time: day(-1, 17) },
  { id: "a4", type: "post", text: "Published Reel “Behind the kitchen” to Instagram", time: day(-1, 12) },
  { id: "a5", type: "whatsapp", text: "Owner approved 3 posts via WhatsApp voice note", time: day(-1, 9) },
  { id: "a6", type: "ad", text: "Shifted $40/day budget to “Weekend Retargeting”", time: day(-2, 15) },
];

export const mockSuggestions: AgentSuggestion[] = [
  { id: "s1", title: "Boost your top Reel", body: "“Behind the kitchen” has 3.1x your average saves. A $25 boost to lookalikes could add ~9K reach.", action: "Create boost" },
  { id: "s2", title: "4 DMs need your call", body: "Pricing questions for private events above your auto-reply threshold.", action: "Open inbox" },
  { id: "s3", title: "Content gap next Thursday", body: "No post scheduled. I drafted a carousel on your new cocktail list.", action: "Review draft" },
];

const img = (_seed: string) => brunch;

export const mockPosts: Post[] = [
  { id: "p1", caption: "Summer menu is here 🍋 Fresh, bright and made for long evenings.", platform: "instagram", format: "carousel", status: "published", date: day(-3, 18), image: img("lemon"), likes: 1240, comments: 86 },
  { id: "p2", caption: "Behind the kitchen: how our chef builds the perfect sauce.", platform: "instagram", format: "reel", status: "published", date: day(-1, 12), image: img("chef"), likes: 3110, comments: 214 },
  { id: "p3", caption: "Weekend brunch — book your table before it fills up!", platform: "facebook", format: "feed", status: "scheduled", date: day(1, 9), image: img("brunch"), likes: 0, comments: 0 },
  { id: "p4", caption: "Meet our new cocktail list. Which one are you trying first?", platform: "instagram", format: "carousel", status: "pending", date: day(4, 19), image: img("cocktail"), likes: 0, comments: 0 },
  { id: "p5", caption: "Customer spotlight: Jean's 10th visit this year 🎉", platform: "facebook", format: "feed", status: "pending", date: day(5, 11), image: img("smile"), likes: 0, comments: 0 },
  { id: "p6", caption: "Quick story: today's fresh catch.", platform: "instagram", format: "story", status: "scheduled", date: day(2, 13), image: img("fish"), likes: 0, comments: 0 },
  { id: "p7", caption: "Draft: Private events — your celebration, our kitchen.", platform: "instagram", format: "feed", status: "draft", date: day(7, 10), image: img("party"), likes: 0, comments: 0 },
  { id: "p8", caption: "Draft: Rainy day soup special.", platform: "facebook", format: "feed", status: "draft", date: day(9, 12), image: img("soup"), likes: 0, comments: 0 },
];

export const mockMedia: MediaItem[] = ["lemon", "chef", "brunch", "cocktail", "smile", "fish", "party", "soup", "bread", "coffee", "table", "garden"].map(
  (s, i) => ({ id: `m${i}`, url: img(s), name: `${s}.jpg`, type: i % 4 === 1 ? "video" : "image" }),
);

export const mockConversations: Conversation[] = [
  {
    id: "c1", name: "Aline Mukamana", handle: "@aline.events", channel: "dm", platform: "instagram", unread: true, status: "needs_owner", time: day(0, 8),
    messages: [
      { id: "1", from: "customer", text: "Hi! Do you do private catering? We're planning a party for about 80 guests.", time: day(0, 7) },
      { id: "2", from: "agent", text: "Hi Aline! Yes, we do 🎉 What date are you thinking of, and do you have a budget range in mind?", time: day(0, 7) },
      { id: "3", from: "customer", text: "Dec 14th. Around $2,500. Can you do a discount for that size?", time: day(0, 8) },
    ],
    suggestedReply: "Dec 14th works! For 80 guests we can offer our Celebration package at $2,350 (6% off). Want me to send the menu options?",
  },
  {
    id: "c2", name: "Patrick N.", handle: "@patrick_n", channel: "comment", platform: "instagram", unread: true, status: "open", time: day(0, 6), postTitle: "Summer menu launch",
    messages: [{ id: "1", from: "customer", text: "Is the lemon tart available all week?", time: day(0, 6) }],
    suggestedReply: "Yes Patrick! The lemon tart is on the menu every day this summer 🍋",
  },
  {
    id: "c3", name: "Grace Uwase", handle: "Grace Uwase", channel: "dm", platform: "facebook", unread: false, status: "resolved", time: day(-1, 14),
    messages: [
      { id: "1", from: "customer", text: "What time do you open on Sundays?", time: day(-1, 13) },
      { id: "2", from: "agent", text: "We open at 9am on Sundays, with brunch until 2pm ☀️", time: day(-1, 13) },
      { id: "3", from: "customer", text: "Perfect, thanks!", time: day(-1, 14) },
    ],
  },
  {
    id: "c4", name: "Eric K.", handle: "@erick.foodie", channel: "comment", platform: "instagram", unread: false, status: "open", time: day(-1, 11), postTitle: "Behind the kitchen",
    messages: [{ id: "1", from: "customer", text: "This looks amazing 😍 do you take reservations online?", time: day(-1, 11) }],
    suggestedReply: "Thank you Eric! Yes — tap the link in our bio to book in under a minute.",
  },
  {
    id: "c5", name: "Diane Ishimwe", handle: "Diane Ishimwe", channel: "dm", platform: "facebook", unread: true, status: "needs_owner", time: day(-2, 16),
    messages: [{ id: "1", from: "customer", text: "We'd like to book the whole terrace for a corporate lunch for 40 people next month. Who do I talk to?", time: day(-2, 16) }],
    suggestedReply: "Hi Diane, thanks for thinking of us! I'm connecting you with our owner now — could you share your preferred date?",
  },
];

export const mockCampaigns: Campaign[] = [
  { id: "cp1", name: "Weekend Retargeting", objective: "Conversions", status: "active", budget: 60, spend: 412, impressions: 58200, clicks: 1840, results: 64, roas: 4.2, start: day(-14) },
  { id: "cp2", name: "Summer Menu Awareness", objective: "Reach", status: "active", budget: 40, spend: 286, impressions: 91400, clicks: 1210, results: 91400, roas: 2.1, start: day(-10) },
  { id: "cp3", name: "Private Events Leads", objective: "Leads", status: "active", budget: 35, spend: 198, impressions: 22100, clicks: 690, results: 23, roas: 5.6, start: day(-8) },
  { id: "cp4", name: "Brunch Carousel Test", objective: "Traffic", status: "paused", budget: 20, spend: 140, impressions: 18300, clicks: 210, results: 210, roas: 1.1, start: day(-20) },
  { id: "cp5", name: "Holiday Gift Cards", objective: "Conversions", status: "draft", budget: 50, spend: 0, impressions: 0, clicks: 0, results: 0, roas: 0, start: day(10) },
];

export const mockLeads: Lead[] = [
  { id: "l1", name: "Aline Mukamana", source: "Instagram DM", interest: "Private catering · 80 guests", value: 2500, status: "hot", lastContact: day(0, 8) },
  { id: "l2", name: "Diane Ishimwe", source: "Facebook DM", interest: "Corporate terrace lunch · 40 people", value: 1800, status: "hot", lastContact: day(-2, 16) },
  { id: "l3", name: "Samuel B.", source: "Lead ad", interest: "Birthday dinner · 15 guests", value: 450, status: "contacted", lastContact: day(-1, 10) },
  { id: "l4", name: "Claire H.", source: "Instagram comment", interest: "Weekly office lunch delivery", value: 1200, status: "new", lastContact: day(-1, 9) },
  { id: "l5", name: "Olivier T.", source: "Lead ad", interest: "Wedding rehearsal dinner", value: 3200, status: "won", lastContact: day(-5, 14) },
  { id: "l6", name: "Nadia R.", source: "Facebook comment", interest: "Gift cards × 20", value: 600, status: "lost", lastContact: day(-6, 12) },
];

export const mockAnalytics: AnalyticsPoint[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (89 - i));
  const w = Math.sin(i / 6) * 0.25 + 1 + i / 120;
  return {
    date: d.toISOString().slice(0, 10),
    reach: Math.round(5200 * w + (i % 7) * 180),
    engagement: Math.round(310 * w + (i % 5) * 22),
    leads: Math.max(0, Math.round(4 * w + ((i * 7) % 4) - 1)),
    spend: Math.round(110 * w),
    results: Math.round(12 * w + (i % 3)),
  };
});

export const mockAgentHistory: AgentMessage[] = [
  { id: "h1", role: "agent", text: "Good morning! Overnight I replied to 14 comments, qualified 2 new leads and paused one underperforming ad. Want the details or should we plan next week's content?", time: day(0, 8) },
];

export const mockAgentResponses: { keywords: string[]; reply: string }[] = [
  { keywords: ["post", "content", "idea", "caption"], reply: "Here are 5 post ideas for next week:\n\n1. **Reel** — 15s “From market to plate” of the summer salad\n2. **Carousel** — The new cocktail list, one drink per slide\n3. **Story poll** — “Lemon tart or berry pavlova?”\n4. **Feed** — Customer spotlight with a quote\n5. **Reel** — Chef's 3 tips for perfect brunch eggs\n\nI've saved them as drafts in Content → Approval queue." },
  { keywords: ["ad", "campaign", "roas", "budget", "underperform"], reply: "Ad check-in:\n\n- **Private Events Leads** is your best performer — 5.6x ROAS, $8.60 per lead.\n- **Brunch Carousel Test** is underperforming (1.1x ROAS) — I paused it yesterday.\n- Recommendation: move $20/day from Summer Awareness to Private Events Leads.\n\nShould I apply that budget change?" },
  { keywords: ["reply", "inbox", "dm", "comment", "message", "discount"], reply: "You have **4 conversations** waiting. The most valuable is Aline (catering, ~$2,500). My suggested reply:\n\n> “Dec 14th works! For 80 guests we can offer our Celebration package at $2,350 (6% off). Want me to send the menu options?”\n\nSay **send** and I'll post it." },
  { keywords: ["lead", "opportunit", "deal"], reply: "Pipeline right now: **2 hot leads** worth $4,300, 1 contacted, 1 new. Diane (corporate lunch, 40 ppl) hasn't heard back in 2 days — want me to send a friendly follow-up?" },
  { keywords: ["analytic", "report", "week", "performance", "reach"], reply: "Last 7 days vs previous:\n\n- Reach **48.2K** (+12%)\n- Engagement rate **5.8%** (+0.9pt)\n- Qualified leads **37** (+22%)\n- Ad spend **$1,036**, ROAS **3.4x**\n\nYour Reels drive 61% of new followers — I'd keep 2 per week." },
];

export const mockTeam: TeamMember[] = [
  { id: "t1", name: "Clement U.", email: "clement@kaliza.app", role: "Owner" },
  { id: "t2", name: "Sandrine M.", email: "sandrine@kaliza.app", role: "Editor" },
  { id: "t3", name: "Kevin R.", email: "kevin@kaliza.app", role: "Viewer" },
];

export const mockAccounts: ConnectedAccount[] = [
  { id: "instagram", name: "Instagram", handle: "@lavillabistro", connected: true },
  { id: "facebook", name: "Facebook Page", handle: "La Villa Bistro", connected: true },
  { id: "meta_ads", name: "Meta Ad Account", handle: "act_2048193", connected: true },
  { id: "whatsapp", name: "WhatsApp", handle: "+250 788 000 000", connected: false },
];

export const mockActions: import('./types').AgentAction[] = [
 { id: 'ap1', kind: 'post', title: 'Weekend brunch campaign', body: 'Slow mornings. Fresh ingredients. Your table is waiting. Reserve this weekend at La Villa Bistro.', targetId: 'p4', image: brunch, status: 'pending' },
 { id: 'ab1', kind: 'budget', title: 'Scale your strongest campaign', body: 'Private Events leads returns 5.6× ROAS. Proposed daily budget: $45, up from $35. Owner approval required.', targetId: 'cp3', amount: 45, status: 'pending' },
 { id: 'ar1', kind: 'reply', title: 'Aline · private catering', body: "Thanks Aline! I’ll ask our owner to confirm availability and a quote for your 80 guests. Could you share your preferred menu?", targetId: 'c1', status: 'pending' }
];
export const mockTenants = [{id:'demo-villa',name:'La Villa Bistro',plan:'Pro',status:'Trial',paused:false},{id:'demo-apex',name:'Apex Fitness',plan:'Scale',status:'Active',paused:false},{id:'demo-lumina',name:'Lumina Goods',plan:'Starter',status:'Active',paused:true}];
export const mockJobs = [{name:'Weekend content plan',tenant:'La Villa Bistro',status:'Awaiting approval',progress:100},{name:'Ad performance review',tenant:'Apex Fitness',status:'Completed',progress:100},{name:'Lead qualification',tenant:'Lumina Goods',status:'Paused',progress:32}];

// ─── Pricing, promo codes and usage ──────────────────────────────────────────
// Product model: every customer's sandbox runs 24/7, so its cost is a fixed BASE counted
// in every plan. Only what varies is metered: agent requests, voice minutes and storage.
// Retail rates and allowances are placeholders an administrator edits in Admin > Pricing.
const universalFeatures = [
  "Every feature on every plan",
  "Control from WhatsApp and the dashboard",
  "You approve before anything goes live",
  "Results measured against your starting point",
];

export const mockPricing: PricingCatalog = {
  currency: "USD",
  baseFee: 69,
  demoPromoHint: "LAUNCH25",
  lifecycle: { liveAfterFailedPaymentDays: 7, backupKeptDays: 30 },
  resources: [
    {
      key: "brands", label: "Brands", group: "workspace", provider: "Kaliza", kind: "limit",
      summary: "Businesses you run from one account.",
      counts: "Each brand is one Instagram account, Facebook Page and Meta ad account with its own voice, memory and approval queue. The first brand is included in every custom plan.",
      suffix: " brands", singular: " brand", min: 1, max: 25, step: 1, rate: 20, rateBasis: { per: 1, unit: "extra brand" }, freeUnits: 1,
    },
    {
      key: "seats", label: "Team seats", group: "workspace", provider: "Kaliza", kind: "limit",
      summary: "People who can sign in.",
      counts: "Everyone invited to the workspace with a role (owner, editor, viewer). The owner seat is always included.",
      suffix: " seats", singular: " seat", min: 1, max: 50, step: 1, rate: 6, rateBasis: { per: 1, unit: "extra seat" }, freeUnits: 1,
    },
    {
      key: "adSpend", label: "Managed ad spend", group: "meta", provider: "Meta Marketing API", kind: "limit",
      summary: "Ad budget Kaliza may manage each month.",
      counts: "The monthly ad budget across your connected ad accounts that Kaliza can create, change and pause. The ad spend itself is paid to Meta, not to Kaliza.",
      prefix: "$", suffix: "", min: 0, max: 250000, step: 500, rate: 0.001, rateBasis: { per: 1, unit: "managed spend", percent: true },
    },
    {
      key: "conversionEvents", label: "Conversion events", group: "meta", provider: "Meta Conversions API", kind: "limit",
      summary: "Real outcomes sent back to Meta.",
      counts: "Each lead, booking or sale event Kaliza sends to Meta through the Conversions API so ads learn from real results.",
      suffix: " events", singular: " event", min: 0, max: 1000000, step: 5000, rate: 0.0001, rateBasis: { per: 1000, unit: "events" },
    },
    {
      key: "agentRequests", label: "Agent requests", group: "agent", provider: "OpenCode and the model provider", kind: "usage",
      summary: "Jobs your operator takes on.",
      counts: "Each time your operator is asked to do something: an instruction from you, a comment or DM it answers, or a job it runs on schedule. Your operator’s sandbox is on 24/7, so hours are never counted; only requests are.",
      suffix: " requests", singular: " request", min: 0, max: 50000, step: 100, rate: 0.14, rateBasis: { per: 1, unit: "request" },
    },
    {
      key: "voiceMinutes", label: "Real-time voice", group: "channels", provider: "Vapi or Retell AI", kind: "usage",
      summary: "Spoken conversations with your operator.",
      counts: "Minutes a live voice call with your operator is connected, counted by the second and rounded up to the next minute at month end.",
      suffix: " min", min: 0, max: 5000, step: 50, rate: 0.28, rateBasis: { per: 1, unit: "minute" },
    },
    {
      key: "storageGb", label: "Media storage", group: "storage", provider: "Cloudflare R2 or AWS S3", kind: "usage",
      summary: "Photos, videos and creatives you keep.",
      counts: "Everything in your media library: files you upload or send on WhatsApp, plus creatives and edited videos the agent produces. Sandbox backups are not counted against it.",
      suffix: " GB", min: 1, max: 1000, step: 5, rate: 0.03, rateBasis: { per: 1, unit: "GB" },
    },
  ],
  plans: [
    {
      id: "starter", name: "Starter", price: 79, tagline: "Your growth stage",
      includes: { brands: 1, seats: 1, adSpend: 2500, conversionEvents: 10000, agentRequests: 200, voiceMinutes: 100, storageGb: 5 },
      features: universalFeatures,
    },
    {
      id: "pro", name: "Pro", price: 149, tagline: "Popular choice", popular: true,
      includes: { brands: 2, seats: 3, adSpend: 10000, conversionEvents: 50000, agentRequests: 600, voiceMinutes: 300, storageGb: 25 },
      features: universalFeatures,
    },
    {
      id: "scale", name: "Scale", price: 299, tagline: "Your growth stage",
      includes: { brands: 5, seats: 8, adSpend: 40000, conversionEvents: 200000, agentRequests: 1500, voiceMinutes: 1000, storageGb: 100 },
      features: universalFeatures,
    },
    {
      id: "agency", name: "Agency", price: 599, tagline: "Multiple businesses",
      includes: { brands: 10, seats: 20, adSpend: 100000, conversionEvents: 500000, agentRequests: 4000, voiceMinutes: 2000, storageGb: 250 },
      features: universalFeatures,
      note: "White-label and custom compute are future features, not available in V1.",
    },
  ],
  guarantees: [
    {
      title: "Always on, always backed up",
      body: "Your operator’s sandbox runs 24/7, so it is ready the moment a customer writes or you send a message. It is backed up continuously on every plan: if it is ever rebuilt, it comes back with its files, memory and unfinished work.",
    },
    {
      title: "You stay in control",
      body: "Approve, reject or pause your operator from WhatsApp or the dashboard at any time.",
    },
    {
      title: "Replies only",
      body: "Kaliza answers customers who comment or message you first. It never starts a conversation.",
    },
  ],
  alwaysIncluded: [
    "Scheduling, publishing and the content calendar",
    "Unified inbox for comments and DMs",
    "Analytics and your results report",
    "Meta Graph, Marketing and Conversions API connections",
    "WhatsApp owner chat and approvals",
    "Your always-on sandbox, database, hosting and audit trail",
  ],
  overagePolicy:
    "Allowances reset every month. As you approach one, Kaliza warns you. At the limit your operator keeps working in a lighter mode instead of stopping, and nothing is billed beyond your plan without your approval.",
};

// What things cost us. Admin only: never served by the public pricing endpoint.
// Checked against each provider's published prices on 31 October 2026.
export const mockCosts: Pick<AdminPricing, "costs" | "baseCosts" | "costsCheckedOn"> = {
  costsCheckedOn: "2026-10-31",
  baseCosts: [
    {
      id: "sandbox",
      label: "Always-on sandbox",
      monthlyPerUnit: 48.62,
      unitsByPlan: { starter: 1, pro: 1, scale: 1, agency: 1 },
      basis:
        "Daytona bills per second for what a sandbox reserves: $0.0504 per vCPU-hour and $0.0162 per GiB-hour of memory, with disk free up to 5 GiB. At Daytona’s default size (1 vCPU, 1 GiB memory, 3 GiB disk) that is $0.0666 an hour, or $48.62 over a 730-hour month. A 2 vCPU, 4 GiB sandbox costs $120.89 a month. Units per plan assume one sandbox per account; one per brand is still an open decision.",
      source: "daytona.io/pricing",
    },
    {
      id: "platform",
      label: "Shared platform (database, cache, hosting, queues)",
      monthlyPerUnit: 0,
      unitsByPlan: { starter: 1, pro: 1, scale: 1, agency: 1 },
      basis: "Not measured yet. Enter each account’s share once the stack is chosen.",
      source: "Internal",
    },
  ],
  costs: [
    {
      key: "agentRequests", unitCost: 0.1,
      costLabel: "$0.10 per request, planning figure",
      basis:
        "Planning assumption of about 40,000 input and 3,000 output tokens per request on Claude Sonnet 5.5, listed at $2 and $10 per million tokens: 0.04 × $2 + 0.003 × $10 ≈ $0.11, rounded to $0.10 with prompt caching. Haiku 5.5 ($0.10 and $0.50 per million) would cost about 20 times less for routine replies. The model and the real tokens per request are not measured yet.",
      source: "platform.claude.com pricing",
    },
    {
      key: "voiceMinutes", unitCost: 0.2,
      costLabel: "$0.20 per minute, all in",
      basis:
        "Vapi charges a $0.05 per minute platform fee, with speech-to-text, the model, the voice and telephony passed through at cost. Published all-in figures run from about $0.10 to $0.31 per minute depending on the voice and model; $0.20 is the planning midpoint.",
      source: "vapi.ai/pricing and 2026 third-party breakdowns",
    },
    {
      key: "storageGb", unitCost: 0.015,
      costLabel: "$0.015 per GB-month",
      basis: "Cloudflare R2 standard storage is $0.015 per GB-month with no egress fees, and the first 10 GB on the account are free.",
      source: "developers.cloudflare.com/r2/pricing",
    },
    ...(["brands", "seats", "adSpend", "conversionEvents"] as const).map((key) => ({
      key,
      unitCost: null,
      costLabel: "Plan limit, no per-unit cost",
      basis: "A boundary of the plan. No per-unit provider cost is modelled.",
      source: "n/a",
    })),
  ],
};

export const mockPromoCodes: PromoCode[] = [
  { code: "LAUNCH25", label: "25% off", kind: "percent", value: 25, months: 3, appliesTo: "all", expires: "2026-12-31" },
  { code: "FOUNDER50", label: "50% off", kind: "percent", value: 50, months: 1, appliesTo: "all", expires: "2027-03-31" },
  { code: "WELCOME20", label: "$20 off", kind: "amount", value: 20, months: 1, appliesTo: ["starter", "pro", "scale", "agency"], expires: "2027-06-30" },
  { code: "AGENCY10", label: "10% off", kind: "percent", value: 10, months: null, appliesTo: ["agency"] },
  { code: "SUMMER26", label: "30% off", kind: "percent", value: 30, months: 2, appliesTo: "all", expires: "2026-09-30" },
];

export const mockUsageSnapshot: Omit<UsageSnapshot, "limits"> = {
  planId: "pro",
  planName: "Pro",
  isDemo: true,
  periodStart: day(-12, 0),
  periodEnd: day(18, 0),
  used: { brands: 1, seats: 3, adSpend: 4200, conversionEvents: 12480, agentRequests: 214, voiceMinutes: 182, storageGb: 3.2 },
};
