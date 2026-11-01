// The backend contract.
//
// `api.ts` is the only module the UI imports, and `api.ts` delegates every domain
// read and write to one `DataSource`. Today that is `mockSource` (mock-source.ts).
// Going live means writing a second implementation of this interface (HTTP calls to
// the Kaliza backend), changing the one line in api.ts that picks the source, and
// deleting mock.ts and mock-source.ts. Nothing else in the app changes.
//
// Authentication and the workspace row stay in api.ts: they talk to Supabase, which
// remains the identity provider.
import type {
  ActivityItem, AdminPricing, AgentAction, AgentMessage, AgentSuggestion, AnalyticsPoint, Campaign, CampaignInput,
  CampaignStatus, CheckoutIntent, ConnectedAccount, Conversation, DashboardMetric, Lead, LeadStatus,
  MediaItem, PricingCatalog, Post, PostInput, PostStatus, PromoResult, TeamMember, UsageSnapshot,
} from "./types";

export interface AdminPreview {
  tenants: { id: string; name: string; plan: string; status: string; paused: boolean }[];
  jobs: { name: string; tenant: string; status: string; progress: number }[];
}

export interface DataSource {
  // Overview
  getDashboardMetrics(): Promise<DashboardMetric[]>;
  getActivityFeed(): Promise<ActivityItem[]>;
  getAgentSuggestions(): Promise<AgentSuggestion[]>;

  // Content
  getPosts(): Promise<Post[]>;
  getMediaLibrary(): Promise<MediaItem[]>;
  updatePostStatus(id: string, status: PostStatus): Promise<Post | undefined>;
  savePost(post: PostInput): Promise<Post | undefined>;
  addMedia(url: string, name: string): Promise<MediaItem>;

  // Inbox. The backend must refuse replies to conversations the customer did not start.
  getConversations(): Promise<Conversation[]>;
  sendReply(conversationId: string, text: string): Promise<Conversation | undefined>;
  updateConversation(id: string, patch: Partial<Pick<Conversation, "status" | "unread">>): Promise<Conversation | undefined>;

  // Ads
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  getCampaignPerformance(id: string): Promise<{ date: string; spend: number; results: number }[]>;
  updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign | undefined>;
  saveCampaign(input: CampaignInput): Promise<Campaign | undefined>;

  // Leads
  getLeads(): Promise<Lead[]>;
  updateLeadStatus(id: string, status: LeadStatus): Promise<Lead | undefined>;

  // Analytics
  getAnalytics(days: number): Promise<AnalyticsPoint[]>;

  // Agent. The backend runs the real agent; the mock fakes it with keyword matching.
  getAgentHistory(): Promise<AgentMessage[]>;
  getAgentActions(): Promise<AgentAction[]>;
  sendAgentMessage(text: string): Promise<AgentMessage>;
  resolveAgentAction(id: string, approved: boolean, amount?: number): Promise<AgentAction | undefined>;

  // Settings
  getConnectedAccounts(): Promise<ConnectedAccount[]>;
  connectAccount(id: string): Promise<ConnectedAccount>;
  getTeam(): Promise<TeamMember[]>;
  inviteTeamMember(email: string): Promise<TeamMember>;

  // Pricing, billing and usage
  getPricingCatalog(): Promise<PricingCatalog>;
  validatePromoCode(code: string): Promise<PromoResult>;
  getUsageSnapshot(): Promise<UsageSnapshot>;
  saveCheckoutIntent(intent: Omit<CheckoutIntent, "savedAt">): Promise<CheckoutIntent>;
  getCheckoutIntent(): Promise<CheckoutIntent | null>;

  // Administrator pricing. The backend must restrict both calls to administrators and
  // must never include costs in the public getPricingCatalog response.
  getAdminPricing(): Promise<AdminPricing>;
  saveAdminPricing(pricing: AdminPricing): Promise<AdminPricing>;

  // Platform administration preview shown to signed-out visitors
  getAdminPreview(): Promise<AdminPreview>;
}
