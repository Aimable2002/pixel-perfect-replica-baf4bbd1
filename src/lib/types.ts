export type Platform = "instagram" | "facebook";
export type PostStatus = "draft" | "pending" | "scheduled" | "published";
export interface DashboardMetric { id: string; label: string; value: string; change: number }
export interface ActivityItem { id: string; type: "reply" | "lead" | "ad" | "post" | "whatsapp"; text: string; time: string }
export interface AgentSuggestion { id: string; title: string; body: string; action: string }
export interface Post { id: string; caption: string; platform: Platform; format: "feed" | "reel" | "story" | "carousel"; status: PostStatus; date: string; image: string; likes: number; comments: number }
export interface MediaItem { id: string; url: string; name: string; type: "image" | "video" }
export interface ChatMessage { id: string; from: "customer" | "agent" | "owner"; text: string; time: string }
export interface Conversation { id: string; name: string; handle: string; channel: "dm" | "comment"; platform: Platform; unread: boolean; status: "open" | "needs_owner" | "resolved"; time: string; postTitle?: string; messages: ChatMessage[]; suggestedReply?: string }
export type CampaignStatus = "active" | "paused" | "draft";
export interface Campaign { id: string; name: string; objective: string; status: CampaignStatus; budget: number; spend: number; impressions: number; clicks: number; results: number; roas: number; start: string }
export type LeadStatus = "new" | "contacted" | "hot" | "won" | "lost";
export interface Lead { id: string; name: string; source: string; interest: string; value: number; status: LeadStatus; lastContact: string }
export interface AnalyticsPoint { date: string; reach: number; engagement: number; leads: number; spend: number; results: number }
export interface AgentMessage { id: string; role: "user" | "agent"; text: string; time: string; actionIds?: string[] }
export interface TeamMember { id: string; name: string; email: string; role: "Owner" | "Editor" | "Viewer" }
export interface ConnectedAccount { id: string; name: string; handle: string; connected: boolean }

export interface AgentAction { id: string; kind: 'post' | 'budget' | 'reply'; title: string; body: string; targetId: string; status: 'pending' | 'approved' | 'rejected'; amount?: number; image?: string }

// ─── Inputs ──────────────────────────────────────────────────────────────────
export type PostInput = Omit<Post, "id" | "likes" | "comments"> & { id?: string };
export type CampaignInput = Pick<Campaign, "name" | "objective" | "budget"> & { id?: string };

// ─── Pricing and metered usage ───────────────────────────────────────────────
// Every resource Kaliza consumes on a customer's behalf is listed here, so plans,
// the custom plan builder, the billing meters and (later) the invoices all share
// one vocabulary.
export type ResourceKey =
  | "brands"
  | "seats"
  | "adSpend"
  | "conversionEvents"
  | "voiceMinutes"
  | "agentRequests"
  | "storageGb";

export type UsageMap = Record<ResourceKey, number>;
export type ResourceGroup = "workspace" | "meta" | "channels" | "agent" | "storage";

export interface UsageResource {
  key: ResourceKey;
  label: string;
  group: ResourceGroup;
  /** Who delivers or meters this resource. */
  provider: string;
  /** One plain sentence for cards and tooltips. */
  summary: string;
  /** Exactly what is counted, and when counting starts and stops. */
  counts: string;
  /** Display: `${prefix}${amount}${suffix}`; `singular` replaces `suffix` when the amount is 1. */
  prefix?: string;
  suffix: string;
  singular?: string;
  /**
   * "usage" costs money to provide and is metered; "limit" is a plan boundary with no
   * per-unit provider cost (brands, seats, ad spend ceiling, conversion events).
   */
  kind: "usage" | "limit";
  /** Limits for the custom plan builder. */
  min: number;
  max: number;
  step: number;
  /** Retail price per unit above `freeUnits`, set by an administrator. */
  rate: number;
  /** How the rate is shown: "$X per {per} {unit}", or a percentage of the amount. */
  rateBasis: { per: number; unit: string; percent?: boolean };
  freeUnits?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  tagline: string;
  popular?: boolean;
  /** Monthly allowance for every metered resource. 0 means not included. */
  includes: UsageMap;
  features: string[];
  note?: string;
}

export interface PricingCatalog {
  currency: "USD";
  /** Flat monthly fee added to every custom plan. */
  baseFee: number;
  resources: UsageResource[];
  plans: PricingPlan[];
  /** Platform capabilities that are never metered. */
  alwaysIncluded: string[];
  /** Promises worth saying out loud, shown above the usage table. */
  guarantees: { title: string; body: string }[];
  /** What happens to a customer's sandbox when a payment fails. */
  lifecycle: { liveAfterFailedPaymentDays: number; backupKeptDays: number };
  overagePolicy: string;
  /** Mock/demo only: a code worth showing next to the promo field. */
  demoPromoHint?: string;
}

export interface PromoCode {
  code: string;
  /** Short customer-facing description, e.g. "25% off for 3 months". */
  label: string;
  kind: "percent" | "amount";
  value: number;
  /** How many billing months the discount lasts; null means for as long as the subscription runs. */
  months: number | null;
  /** Plan ids and/or "custom"; "all" covers every plan and the custom plan. */
  appliesTo: string[] | "all";
  expires?: string;
}

export type PromoResult = { valid: true; promo: PromoCode } | { valid: false; reason: string };

export interface UsageSnapshot {
  /** null when the workspace has no subscription. */
  planId: string | null;
  planName: string | null;
  isDemo: boolean;
  periodStart: string;
  periodEnd: string;
  used: UsageMap;
  limits: UsageMap;
}

export interface CheckoutIntent {
  kind: "plan" | "custom";
  planId?: string;
  usage?: UsageMap;
  promoCode?: string;
  /** Regular monthly price before any promo. */
  monthlyPrice: number;
  savedAt: string;
}

// ─── Administrator pricing and cost (never sent to the public pricing page) ───
export interface ResourceCost {
  key: ResourceKey;
  /** What it costs us per unit of the resource; null when no per-unit cost is modelled. */
  unitCost: number | null;
  /** One line for the table, e.g. "$0.20 per minute, all in". */
  costLabel: string;
  /** How the figure was derived, including any assumption. */
  basis: string;
  /** Where the price was checked. */
  source: string;
}

/** A cost that is paid whether or not a customer uses anything: the always-on sandbox and shared platform. */
export interface BaseCost {
  id: string;
  label: string;
  /** What one unit costs us per month. */
  monthlyPerUnit: number;
  /** How many units each plan carries, by plan id (for example one always-on sandbox). */
  unitsByPlan: Record<string, number>;
  basis: string;
  source: string;
}

export interface AdminPricing {
  /** The retail side: exactly what the public pricing page shows. */
  catalog: PricingCatalog;
  /** Per-unit cost of the metered resources. */
  costs: ResourceCost[];
  /** Always-on costs counted as the base of every plan. */
  baseCosts: BaseCost[];
  /** ISO date the provider prices were last checked. */
  costsCheckedOn: string;
}
