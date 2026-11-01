// In-memory implementation of the backend contract, seeded from mock.ts.
// Delete this file and mock.ts when the real backend is connected (see datasource.ts).
//
// It behaves like a backend would: it owns the data, enforces the product rules and
// returns copies, so the UI can never mutate the store by accident. Changes live in
// memory only and reset on reload.
import brunch from "@/assets/bistro-brunch.jpg";
import { allowedAgentAction, canReply } from "./rules";
import * as seed from "./mock";
import type { AdminPreview, DataSource } from "./datasource";
import { pricingProblem } from "./pricing";
import type {
  AdminPricing, AgentAction, AgentMessage, Campaign, CheckoutIntent, Lead, MediaItem, PostInput, PromoResult, TeamMember,
} from "./types";

const wait = <T>(data: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const db = {
  metrics: structuredClone(seed.mockMetrics),
  activity: structuredClone(seed.mockActivity),
  suggestions: structuredClone(seed.mockSuggestions),
  posts: structuredClone(seed.mockPosts),
  media: structuredClone(seed.mockMedia),
  conversations: structuredClone(seed.mockConversations),
  campaigns: structuredClone(seed.mockCampaigns),
  leads: structuredClone(seed.mockLeads),
  analytics: structuredClone(seed.mockAnalytics),
  history: structuredClone(seed.mockAgentHistory),
  actions: structuredClone(seed.mockActions),
  accounts: structuredClone(seed.mockAccounts),
  team: structuredClone(seed.mockTeam),
  catalog: structuredClone(seed.mockPricing),
  costs: structuredClone(seed.mockCosts.costs),
  baseCosts: structuredClone(seed.mockCosts.baseCosts),
  costsCheckedOn: seed.mockCosts.costsCheckedOn,
};

const adminPricing = (): AdminPricing => ({
  catalog: db.catalog, costs: db.costs, baseCosts: db.baseCosts, costsCheckedOn: db.costsCheckedOn,
});

// The pricing choice must survive the sign-up redirect, which can reload the page.
const INTENT_KEY = "kaliza-checkout-intent";
const readIntent = (): CheckoutIntent | null => {
  try {
    return JSON.parse(localStorage.getItem(INTENT_KEY) ?? "null") as CheckoutIntent | null;
  } catch {
    return null;
  }
};
const writeIntent = (intent: CheckoutIntent) => {
  try {
    localStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  } catch {
    /* storage unavailable (private mode, SSR): the choice simply isn't remembered */
  }
};

// ─── Store operations shared by several endpoints ────────────────────────────
const findPost = (id: string) => db.posts.find((p) => p.id === id);
const findCampaign = (id: string) => db.campaigns.find((c) => c.id === id);

// Only these fields are writable; likes, comments and ids belong to the backend.
const editablePostFields = ({ caption, platform, format, status, date, image }: PostInput) =>
  ({ caption, platform, format, status, date, image });

function applyPostChanges(id: string, changes: Partial<PostInput>) {
  const post = findPost(id);
  if (post) Object.assign(post, changes);
  return post;
}

function createPost(input: PostInput) {
  const post = { ...editablePostFields(input), id: uid(), likes: 0, comments: 0 };
  db.posts.unshift(post);
  return post;
}

function applyCampaignChanges(id: string, input: { name: string; objective: string; budget: number }) {
  const campaign = findCampaign(id);
  if (campaign) Object.assign(campaign, { name: input.name, objective: input.objective, budget: input.budget });
  return campaign;
}

function postReply(conversationId: string, text: string) {
  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (!canReply(conversation)) throw new Error("Replies require an inbound customer message");
  if (conversation) {
    conversation.messages.push({ id: uid(), from: "owner", text, time: now() });
    conversation.status = "resolved";
    conversation.unread = false;
    delete conversation.suggestedReply;
  }
  return conversation;
}

// ─── Fake agent: keyword matching standing in for the real OpenCode agent ────
const intents = {
  restricted: /\b(billing|permissions?|disconnect|account settings?)\b/i,
  content: /\b(post|content|caption|ideas?)\b/i,
  ads: /\b(ads?|campaigns?|budgets?|roas)\b/i,
  inbox: /\b(reply|replies|inbox|dms?|messages?)\b/i,
  insights: /\b(week|report|analytics?|leads?|pipeline|opportunit\w*|deals?)\b/i,
};

function runFakeAgent(text: string): { body: string; actionIds: string[] } {
  const actionIds: string[] = [];
  const propose = (action: Omit<AgentAction, "id" | "status">) => {
    const created: AgentAction = { ...action, id: uid(), status: "pending" };
    db.actions.push(created);
    actionIds.push(created.id);
  };

  if (intents.restricted.test(text)) {
    return { body: "Only the account owner can change settings, permissions, connections or billing. I cannot perform those actions.", actionIds };
  }

  if (intents.content.test(text)) {
    const caption = /brunch/i.test(text)
      ? seed.mockActions[0]?.body ?? "Weekend brunch is ready for your next visit."
      : "A fresh week, a fresh story. Discover what’s new at our business.";
    const post = createPost({
      caption, platform: "instagram", format: "feed", status: "pending",
      date: new Date(Date.now() + 86_400_000).toISOString(), image: db.posts[0]?.image ?? brunch,
    });
    propose({ kind: "post", title: "Your content draft", body: post.caption, targetId: post.id, image: post.image });
    return { body: "Your draft is ready below. Review it and approve or reject it right here.", actionIds };
  }

  if (intents.ads.test(text)) {
    const campaign = db.campaigns.find((c) => c.status === "active");
    if (!campaign) {
      return { body: "No campaigns connected yet. Create a draft campaign in Ads before requesting an optimization.", actionIds };
    }
    const proposed = Math.round(campaign.budget * 1.2);
    propose({
      kind: "budget", title: campaign.name, targetId: campaign.id, amount: proposed,
      body: `Current daily budget $${campaign.budget}. Proposed $${proposed}. This is a simulation; no Meta spend changes.`,
    });
    return { body: "Here is the campaign change for your review.", actionIds };
  }

  if (intents.inbox.test(text)) {
    const conversation = db.conversations.find((c) => c.suggestedReply && canReply(c));
    if (!conversation) return { body: "There are no inbound conversations waiting for a reply.", actionIds };
    propose({ kind: "reply", title: conversation.name, body: conversation.suggestedReply ?? "", targetId: conversation.id });
    return { body: "Review this reply to an existing inbound conversation before sending.", actionIds };
  }

  if (intents.insights.test(text)) {
    return {
      body: `Your current pipeline has ${db.leads.length} opportunities and ${db.campaigns.length} campaigns. These are saved workspace records, not live Meta results.`,
      actionIds,
    };
  }

  return { body: "I can prepare content, review campaigns, and suggest replies. Choose a request below.", actionIds };
}

// ─── The data source ─────────────────────────────────────────────────────────
export const mockSource: DataSource = {
  getDashboardMetrics: () => wait(db.metrics),
  getActivityFeed: () => wait(db.activity),
  getAgentSuggestions: () => wait(db.suggestions),

  getPosts: () => wait(db.posts),
  getMediaLibrary: () => wait(db.media),
  updatePostStatus: async (id, status) => wait(applyPostChanges(id, { status }), 250),
  savePost: async (input) =>
    wait(input.id ? applyPostChanges(input.id, editablePostFields(input)) : createPost(input), 300),
  addMedia: async (url, name) => {
    const item: MediaItem = { id: uid(), url, name, type: "image" };
    db.media.unshift(item);
    return wait(item, 200);
  },

  getConversations: () => wait(db.conversations),
  sendReply: async (conversationId, text) => wait(postReply(conversationId, text), 300),
  updateConversation: async (id, patch) => {
    const conversation = db.conversations.find((c) => c.id === id);
    if (conversation) Object.assign(conversation, patch);
    return wait(conversation, 150);
  },

  getCampaigns: () => wait(db.campaigns),
  getCampaign: async (id) => wait(findCampaign(id) ?? null, 200),
  getCampaignPerformance: async (id) => {
    const campaign = findCampaign(id);
    const scale = campaign ? campaign.budget / 50 : 1;
    return wait(
      db.analytics.slice(-14).map((p) => ({
        date: p.date,
        spend: Math.round(p.spend * scale * 0.4),
        results: Math.round(p.results * scale),
      })),
    );
  },
  updateCampaignStatus: async (id, status) => {
    const campaign = findCampaign(id);
    if (campaign) campaign.status = status;
    return wait(campaign, 250);
  },
  saveCampaign: async (input) => {
    if (input.id) return wait(applyCampaignChanges(input.id, input), 300);
    const campaign: Campaign = {
      name: input.name, objective: input.objective, budget: input.budget,
      id: uid(), status: "draft", spend: 0, impressions: 0, clicks: 0, results: 0, roas: 0, start: now(),
    };
    db.campaigns.unshift(campaign);
    return wait(campaign, 300);
  },

  getLeads: () => wait(db.leads),
  updateLeadStatus: async (id, status) => {
    const lead: Lead | undefined = db.leads.find((l) => l.id === id);
    if (lead) lead.status = status;
    return wait(lead, 200);
  },

  getAnalytics: (days) => wait(db.analytics.slice(-days)),

  getAgentHistory: () => wait(db.history),
  getAgentActions: () => wait(db.actions),
  sendAgentMessage: async (text) => {
    const { body, actionIds } = runFakeAgent(text);
    const reply: AgentMessage = { id: uid(), role: "agent", text: body, time: now(), actionIds };
    db.history.push({ id: uid(), role: "user", text, time: now() }, reply);
    return wait(reply, 500);
  },
  resolveAgentAction: async (id, approved, amount) => {
    const action = db.actions.find((a) => a.id === id);
    if (!action || action.status !== "pending") return undefined;
    if (!allowedAgentAction(action.kind)) throw new Error("Action not allowed");
    if (approved) {
      if (action.kind === "post") applyPostChanges(action.targetId, { status: "scheduled" });
      if (action.kind === "reply") postReply(action.targetId, action.body);
      if (action.kind === "budget") {
        const campaign = findCampaign(action.targetId);
        if (campaign) campaign.budget = amount ?? action.amount ?? campaign.budget;
      }
    }
    action.status = approved ? "approved" : "rejected";
    return wait(action, 200);
  },

  getConnectedAccounts: () => wait(db.accounts),
  connectAccount: async () => {
    throw new Error("Live Meta and WhatsApp connection requires provider setup. No account has been connected.");
  },
  getTeam: () => wait(db.team),
  inviteTeamMember: async (email) => {
    const member: TeamMember = { id: uid(), name: email.split("@")[0] ?? email, email, role: "Viewer" };
    db.team.push(member);
    return wait(member, 300);
  },

  // Public: retail only. Costs never leave getAdminPricing.
  getPricingCatalog: () => wait(db.catalog, 250),
  validatePromoCode: async (code): Promise<PromoResult> => {
    const entered = code.trim().toUpperCase();
    if (!entered) return wait({ valid: false, reason: "Enter a promo code." }, 150);
    const promo = seed.mockPromoCodes.find((p) => p.code === entered);
    if (!promo) return wait({ valid: false, reason: "We don’t recognise that code. Check the spelling and try again." }, 350);
    if (promo.expires && new Date(`${promo.expires}T23:59:59`).getTime() < Date.now()) {
      return wait({ valid: false, reason: `${promo.code} expired on ${new Date(promo.expires).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}.` }, 350);
    }
    return wait({ valid: true, promo }, 350);
  },
  // Limits follow the live catalog, so an administrator's allowance change shows up in Billing.
  getUsageSnapshot: () => {
    const plan = db.catalog.plans.find((p) => p.id === seed.mockUsageSnapshot.planId) ?? db.catalog.plans[0];
    if (!plan) throw new Error("No plans are configured");
    return wait({ ...seed.mockUsageSnapshot, limits: plan.includes });
  },

  getAdminPricing: () => wait(adminPricing(), 250),
  saveAdminPricing: async (next) => {
    const problem = pricingProblem(next.catalog);
    if (problem) throw new Error(problem);
    if (next.costs.some((c) => c.unitCost !== null && !(c.unitCost >= 0))) throw new Error("Costs can’t be negative.");
    if (next.baseCosts.some((b) => !(b.monthlyPerUnit >= 0))) throw new Error("Costs can’t be negative.");
    db.catalog = structuredClone(next.catalog);
    db.costs = structuredClone(next.costs);
    db.baseCosts = structuredClone(next.baseCosts);
    db.costsCheckedOn = next.costsCheckedOn;
    return wait(adminPricing(), 300);
  },

  saveCheckoutIntent: async (intent) => {
    const saved: CheckoutIntent = { ...intent, savedAt: now() };
    writeIntent(saved);
    return wait(saved, 100);
  },
  getCheckoutIntent: () => wait(readIntent(), 100),

  getAdminPreview: (): Promise<AdminPreview> => wait({ tenants: seed.mockTenants, jobs: seed.mockJobs }),
};
