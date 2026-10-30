// The ONLY place the UI gets data from. To go live, replace each function body
// with a real fetch to your backend and delete mock.ts.
import * as mock from "./mock";
import type {
  AgentMessage, Campaign, CampaignStatus, Conversation, LeadStatus, Post, PostStatus,
} from "./types";

export * from "./types";

const delay = <T,>(data: T, ms = 450): Promise<T> =>
  new Promise((r) => setTimeout(() => r(structuredClone(data)), ms));
const uid = () => Math.random().toString(36).slice(2, 10);

// Auth
export const login = (email: string, _password: string) => delay({ ok: true, email }, 600);
export const signup = (name: string, email: string, _password: string) => delay({ ok: true, name, email }, 600);

// Overview
export const getDashboardMetrics = () => delay(mock.mockMetrics);
export const getActivityFeed = () => delay(mock.mockActivity);
export const getAgentSuggestions = () => delay(mock.mockSuggestions);

// Content
export const getPosts = () => delay(mock.mockPosts);
export const getMediaLibrary = () => delay(mock.mockMedia);
export const updatePostStatus = (id: string, status: PostStatus) => {
  const p = mock.mockPosts.find((x) => x.id === id);
  if (p) p.status = status;
  return delay(p, 250);
};
export const savePost = (post: Omit<Post, "id" | "likes" | "comments"> & { id?: string }) => {
  if (post.id) {
    const p = mock.mockPosts.find((x) => x.id === post.id);
    if (p) Object.assign(p, post);
    return delay(p, 300);
  }
  const created: Post = { ...post, id: uid(), likes: 0, comments: 0 };
  mock.mockPosts.unshift(created);
  return delay(created, 300);
};

// Inbox
export const getConversations = () => delay(mock.mockConversations);
export const sendReply = (conversationId: string, text: string) => {
  const c = mock.mockConversations.find((x) => x.id === conversationId);
  if (c) {
    c.messages.push({ id: uid(), from: "owner", text, time: new Date().toISOString() });
    c.status = "resolved";
    c.unread = false;
    c.suggestedReply = undefined;
  }
  return delay(c, 300);
};
export const updateConversation = (id: string, patch: Partial<Pick<Conversation, "status" | "unread">>) => {
  const c = mock.mockConversations.find((x) => x.id === id);
  if (c) Object.assign(c, patch);
  return delay(c, 150);
};

// Ads
export const getCampaigns = () => delay(mock.mockCampaigns);
export const getCampaign = (id: string) => delay(mock.mockCampaigns.find((c) => c.id === id) ?? null);
export const getCampaignPerformance = (id: string) => {
  const c = mock.mockCampaigns.find((x) => x.id === id);
  const scale = c ? c.budget / 50 : 1;
  return delay(mock.mockAnalytics.slice(-14).map((p) => ({ date: p.date, spend: Math.round(p.spend * scale * 0.4), results: Math.round(p.results * scale) })));
};
export const updateCampaignStatus = (id: string, status: CampaignStatus) => {
  const c = mock.mockCampaigns.find((x) => x.id === id);
  if (c) c.status = status;
  return delay(c, 250);
};
export const saveCampaign = (input: Pick<Campaign, "name" | "objective" | "budget"> & { id?: string }) => {
  if (input.id) {
    const c = mock.mockCampaigns.find((x) => x.id === input.id);
    if (c) Object.assign(c, input);
    return delay(c, 300);
  }
  const c: Campaign = { ...input, id: uid(), status: "draft", spend: 0, impressions: 0, clicks: 0, results: 0, roas: 0, start: new Date().toISOString() };
  mock.mockCampaigns.unshift(c);
  return delay(c, 300);
};

// Leads
export const getLeads = () => delay(mock.mockLeads);
export const updateLeadStatus = (id: string, status: LeadStatus) => {
  const l = mock.mockLeads.find((x) => x.id === id);
  if (l) l.status = status;
  return delay(l, 200);
};

// Analytics
export const getAnalytics = (days: number) => delay(mock.mockAnalytics.slice(-days));

// Agent
export const getAgentHistory = () => delay(mock.mockAgentHistory, 200);
export const sendAgentMessage = (text: string): Promise<AgentMessage> => {
  const lower = text.toLowerCase();
  const match = mock.mockAgentResponses.find((r) => r.keywords.some((k) => lower.includes(k)));
  const reply = match?.reply ??
    "Got it. I can help with **content**, **ads**, **inbox replies**, **leads** and **analytics**. Try “Prepare 5 post ideas for next week” or “Show me underperforming ads”.";
  const msg: AgentMessage = { id: uid(), role: "agent", text: reply, time: new Date().toISOString() };
  mock.mockAgentHistory.push({ id: uid(), role: "user", text, time: new Date().toISOString() }, msg);
  return delay(msg, 1100);
};

// Settings
export const getConnectedAccounts = () => delay(mock.mockAccounts);
export const toggleAccountConnection = (id: string) => {
  const a = mock.mockAccounts.find((x) => x.id === id);
  if (a) a.connected = !a.connected;
  return delay(a, 500);
};
export const getTeam = () => delay(mock.mockTeam);
export const inviteTeamMember = (email: string) => {
  const m = { id: uid(), name: email.split("@")[0], email, role: "Viewer" as const };
  mock.mockTeam.push(m);
  return delay(m, 300);
};
