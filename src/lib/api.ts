// The ONLY module the UI imports data from.
//
// Two kinds of functions live here:
//   1. Identity and workspace (Supabase): sign-in, the workspace row, admin roles.
//   2. Everything else: one-line delegations to the data source below.
//
// TO GO LIVE: write an implementation of `DataSource` (see datasource.ts) that calls
// the Kaliza backend, point `source` at it, then delete mock.ts and mock-source.ts.
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { Json } from "@/integrations/supabase/types";
import type { DataSource } from "./datasource";
import { mockSource } from "./mock-source";
import type {
  AdminPricing, AgentAction, CampaignInput, CampaignStatus, CheckoutIntent, Conversation, LeadStatus, PostInput, PostStatus,
} from "./types";

export * from "./types";

const source: DataSource = mockSource;

// ─── Account ─────────────────────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signup = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { business_name: name }, emailRedirectTo: `${window.location.origin}/auth` },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const socialLogin = async (provider: "google" | "lovable") => {
  const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
  if (result.error) throw result.error;
  return result;
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
  if (error) throw error;
};

export const resetPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const watchAuth = (callback: () => void) =>
  supabase.auth.onAuthStateChange((event) => {
    if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) callback();
  }).data.subscription;

// ─── Workspace row (Supabase) ────────────────────────────────────────────────
type State = Record<string, unknown>;

async function workspace() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from("workspaces").select("*").eq("owner_id", user.id).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: createError } = await supabase
    .from("workspaces")
    .insert({ owner_id: user.id, name: String(user.user_metadata["business_name"] || "My business") })
    .select()
    .single();
  if (createError) throw createError;
  return created;
}

async function writeState(key: string, value: unknown) {
  const w = await workspace();
  if (!w) return;
  const state = w.state as State;
  const { error } = await supabase.from("workspaces").update({ state: { ...state, [key]: value } as Json }).eq("id", w.id);
  if (error) throw error;
}

export const getWorkspace = workspace;

export async function getPreferences() {
  const w = await workspace();
  return { ...(((w?.state as State | undefined)?.["preferences"] as State | undefined) ?? {}) } as State;
}

export const savePreferences = (value: State) => writeState("preferences", value);

export async function saveBrand(name: string, value: State) {
  const w = await workspace();
  if (!w) return;
  const state = w.state as State;
  const brand = { ...((state["brand"] as State | undefined) ?? {}), ...value };
  const { error } = await supabase.from("workspaces").update({ name, state: { ...state, brand } as Json }).eq("id", w.id);
  if (error) throw error;
}

// ─── Platform administration (Supabase roles and RLS) ────────────────────────
export async function getAdminAccess() {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (error) throw error;
  return data;
}

export async function getAdminData() {
  if (!(await getAdminAccess())) throw new Error("Administrator access required");
  const [tenants, events] = await Promise.all([
    supabase.from("workspaces").select("*").order("created_at", { ascending: false }),
    supabase.from("audit_events").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  if (tenants.error) throw tenants.error;
  if (events.error) throw events.error;
  return { tenants: tenants.data, events: events.data };
}

export async function pauseTenant(id: string, paused: boolean) {
  if (!(await getAdminAccess())) throw new Error("Administrator access required");
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in required");
  const { error } = await supabase.from("workspaces").update({ paused }).eq("id", id);
  if (error) throw error;
  const { error: logError } = await supabase.from("audit_events").insert({
    actor_id: user.id,
    workspace_id: id,
    action: paused ? "Agent paused by administrator" : "Agent resumed by administrator",
  });
  if (logError) throw logError;
}

export const getDemoAdmin = () => source.getAdminPreview();

// ─── Overview ────────────────────────────────────────────────────────────────
export const getDashboardMetrics = () => source.getDashboardMetrics();
export const getActivityFeed = () => source.getActivityFeed();
export const getAgentSuggestions = () => source.getAgentSuggestions();

// ─── Content ─────────────────────────────────────────────────────────────────
export const getPosts = () => source.getPosts();
export const getMediaLibrary = () => source.getMediaLibrary();
export const updatePostStatus = (id: string, status: PostStatus) => source.updatePostStatus(id, status);
export const savePost = (post: PostInput) => source.savePost(post);
export const addMedia = (url: string, name: string) => source.addMedia(url, name);

// ─── Inbox ───────────────────────────────────────────────────────────────────
export const getConversations = () => source.getConversations();
export const sendReply = (conversationId: string, text: string) => source.sendReply(conversationId, text);
export const updateConversation = (id: string, patch: Partial<Pick<Conversation, "status" | "unread">>) =>
  source.updateConversation(id, patch);

// ─── Ads ─────────────────────────────────────────────────────────────────────
export const getCampaigns = () => source.getCampaigns();
export const getCampaign = (id: string) => source.getCampaign(id);
export const getCampaignPerformance = (id: string) => source.getCampaignPerformance(id);
export const updateCampaignStatus = (id: string, status: CampaignStatus) => source.updateCampaignStatus(id, status);
export const saveCampaign = (input: CampaignInput) => source.saveCampaign(input);

// ─── Leads and analytics ─────────────────────────────────────────────────────
export const getLeads = () => source.getLeads();
export const updateLeadStatus = (id: string, status: LeadStatus) => source.updateLeadStatus(id, status);
export const getAnalytics = (days: number) => source.getAnalytics(days);

// ─── Agent ───────────────────────────────────────────────────────────────────
export const getAgentHistory = () => source.getAgentHistory();
export const getAgentActions = (): Promise<AgentAction[]> => source.getAgentActions();
export const sendAgentMessage = (text: string) => source.sendAgentMessage(text);

export async function resolveAgentAction(id: string, approved: boolean, amount?: number) {
  // The pause flag lives on the Supabase workspace row, so it is checked here.
  const w = await workspace();
  if (w?.paused) throw new Error("The agent is paused by an administrator");
  return source.resolveAgentAction(id, approved, amount);
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const getConnectedAccounts = () => source.getConnectedAccounts();
export const toggleAccountConnection = (id: string) => source.connectAccount(id);
export const getTeam = () => source.getTeam();
export const inviteTeamMember = (email: string) => source.inviteTeamMember(email);

// ─── Pricing, billing and usage ──────────────────────────────────────────────
export const getPricingCatalog = () => source.getPricingCatalog();
export const validatePromoCode = (code: string) => source.validatePromoCode(code);
export const getUsageSnapshot = () => source.getUsageSnapshot();
export const saveCheckoutIntent = (intent: Omit<CheckoutIntent, "savedAt">) => source.saveCheckoutIntent(intent);
export const getCheckoutIntent = () => source.getCheckoutIntent();

// Administrator pricing: retail prices, allowances, and what things cost us.
// Real accounts must hold the admin role. Signed-out visitors get the admin preview,
// where edits stay in their own browser session.
async function requireAdminIfSignedIn() {
  const user = await getCurrentUser();
  if (user && !(await getAdminAccess())) throw new Error("Administrator access required");
}

export async function getAdminPricing() {
  await requireAdminIfSignedIn();
  return source.getAdminPricing();
}

export async function saveAdminPricing(pricing: AdminPricing) {
  await requireAdminIfSignedIn();
  return source.saveAdminPricing(pricing);
}
