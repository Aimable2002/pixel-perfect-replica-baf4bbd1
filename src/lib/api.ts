// The ONLY place the UI gets data from. To go live, replace each function body
// with a real fetch to your backend and delete mock.ts.
import * as mock from "./mock";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { canReply, allowedAgentAction } from "./rules";
import type { AgentAction } from "./types";
import type { Json } from "@/integrations/supabase/types";
import type {
  AgentMessage, Campaign, CampaignStatus, Conversation, LeadStatus, Post, PostStatus,
} from "./types";

export * from "./types";

const delay = <T,>(data: T, ms = 450): Promise<T> =>
  new Promise((r) => setTimeout(() => r(structuredClone(data)), ms));
const uid = () => Math.random().toString(36).slice(2, 10);

// Account and workspace boundary. Signed-out product tours use explicit demo data.
export const login = async (email: string, password: string) => { const {data,error} = await supabase.auth.signInWithPassword({email,password}); if(error) throw error; return data; };
export const signup = async (name: string, email: string, password: string) => { const {data,error} = await supabase.auth.signUp({email,password,options:{data:{business_name:name},emailRedirectTo:`${window.location.origin}/auth`}}); if(error) throw error; return data; };
export const signOut = async () => { const {error} = await supabase.auth.signOut(); if(error) throw error; };
export const socialLogin = async (provider: 'google'|'lovable') => { const result = await lovable.auth.signInWithOAuth(provider,{redirect_uri:`${window.location.origin}/auth`}); if(result.error) throw result.error; return result; };
export const getCurrentUser = async () => { const {data} = await supabase.auth.getUser(); return data.user; };
export const requestPasswordReset = async (email: string) => { const {error} = await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`}); if(error) throw error; };
export const resetPassword = async (password: string) => { const {error} = await supabase.auth.updateUser({password}); if(error) throw error; };
export const watchAuth = (callback: () => void) => supabase.auth.onAuthStateChange(event => { if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) callback(); }).data.subscription;
type State = Record<string, unknown>;
async function workspace() { const user = await getCurrentUser(); if(!user) return null; const {data,error} = await supabase.from('workspaces').select('*').eq('owner_id',user.id).maybeSingle(); if(error) throw error; if(data) return data; const {data:created,error:err} = await supabase.from('workspaces').insert({owner_id:user.id,name:String(user.user_metadata.business_name || 'My business')}).select().single(); if(err) throw err; return created; }
async function read<T>(key: string, demo: T, empty: T): Promise<T> { const w = await workspace(); if(!w) return delay(demo,100); const state = w.state as State; return structuredClone((state[key] ?? empty) as T); }
async function write(key: string, value: unknown) { const w = await workspace(); if(!w) return; const state = w.state as State; const {error} = await supabase.from('workspaces').update({state:{...state,[key]:value} as Json}).eq('id',w.id); if(error) throw error; }
export const getWorkspace = workspace;
export async function savePreferences(value: State) { await write('preferences',value); }
export async function getPreferences() { return read<State>('preferences',{},{}); }
export async function saveBrand(name: string, value: State) { const w=await workspace(); if(!w) return; const {error}=await supabase.from('workspaces').update({name,state:{...(w.state as State),brand:value} as Json}).eq('id',w.id); if(error) throw error; }
export async function getAdminAccess() { const user=await getCurrentUser(); if(!user) return false; const {data,error}=await supabase.rpc('has_role',{_user_id:user.id,_role:'admin'}); if(error) throw error; return data; }
export async function getAdminData() { if(!await getAdminAccess()) throw new Error('Administrator access required'); const [tenants,events]=await Promise.all([supabase.from('workspaces').select('*').order('created_at',{ascending:false}),supabase.from('audit_events').select('*').order('created_at',{ascending:false}).limit(100)]); if(tenants.error) throw tenants.error; if(events.error) throw events.error; return {tenants:tenants.data,events:events.data}; }
export async function pauseTenant(id:string,paused:boolean) { if(!await getAdminAccess()) throw new Error('Administrator access required'); const user=await getCurrentUser(); if(!user) throw new Error('Sign in required'); const {error}=await supabase.from('workspaces').update({paused}).eq('id',id); if(error) throw error; const {error:logError}=await supabase.from('audit_events').insert({actor_id:user.id,workspace_id:id,action:paused?'Agent paused by administrator':'Agent resumed by administrator'}); if(logError) throw logError; }
export const getDemoAdmin = () => delay({tenants:mock.mockTenants,jobs:mock.mockJobs});
export const getUsage = () => read('usage',mock.mockUsage,{voice:0,adSpend:0,events:0});

// Overview
export const getDashboardMetrics = () => read("metrics",mock.mockMetrics,[]);
export const getActivityFeed = () => read("activity",mock.mockActivity,[]);
export const getAgentSuggestions = () => read("suggestions",mock.mockSuggestions,[]);

// Content
export const getPosts = () => read("posts",mock.mockPosts,[]);
export const getMediaLibrary = () => read("media",mock.mockMedia,[]);
export const updatePostStatus = async (id: string, status: PostStatus) => {
  const rows = await getPosts();
  const p = rows.find((x) => x.id === id);
  if (p) p.status = status;
  await write("posts",rows); if(!await getCurrentUser()) mock.mockPosts.splice(0,mock.mockPosts.length,...rows);
  return delay(p, 250);
};
export const savePost = async (post: Omit<Post, "id" | "likes" | "comments"> & { id?: string }) => {
  if (post.id) {
    const rows = await getPosts();
  const p = rows.find((x) => x.id === post.id);
    if (p) Object.assign(p, post);
    await write("posts",rows); if(!await getCurrentUser()) mock.mockPosts.splice(0,mock.mockPosts.length,...rows); return delay(p, 300);
  }
  const created: Post = { ...post, id: uid(), likes: 0, comments: 0 };
  const all = await getPosts(); all.unshift(created); await write("posts",all); if(!await getCurrentUser()) mock.mockPosts.unshift(created);
  return delay(created, 300);
};

// Inbox
export const getConversations = () => read("conversations",mock.mockConversations,[]);
export const sendReply = async (conversationId: string, text: string) => {
  const rows = await getConversations();
  const c = rows.find((x) => x.id === conversationId);
  if (!canReply(c)) throw new Error("Replies require an inbound customer message");
  if (c) {
    c.messages.push({ id: uid(), from: "owner", text, time: new Date().toISOString() });
    c.status = "resolved";
    c.unread = false;
    delete c.suggestedReply;
  }
  await write("conversations",rows); if(!await getCurrentUser()) mock.mockConversations.splice(0,mock.mockConversations.length,...rows); await write("campaigns",rows); if(!await getCurrentUser()) mock.mockCampaigns.splice(0,mock.mockCampaigns.length,...rows); return delay(c, 300);
};
export const updateConversation = async (id: string, patch: Partial<Pick<Conversation, "status" | "unread">>) => {
  const rows = await getConversations();
  const c = rows.find((x) => x.id === id);
  if (c) Object.assign(c, patch);
  await write("conversations",rows); if(!await getCurrentUser()) mock.mockConversations.splice(0,mock.mockConversations.length,...rows); return delay(c, 150);
};

// Ads
export const getCampaigns = () => read("campaigns",mock.mockCampaigns,[]);
export const getCampaign = async (id: string) => (await getCampaigns()).find(c => c.id === id) ?? null;
export const getCampaignPerformance = async (id: string) => {
  const c = (await getCampaigns()).find((x) => x.id === id);
  const scale = c ? c.budget / 50 : 1;
  return delay((await getAnalytics(14)).map((p) => ({ date: p.date, spend: Math.round(p.spend * scale * 0.4), results: Math.round(p.results * scale) })));
};
export const updateCampaignStatus = async (id: string, status: CampaignStatus) => {
  const rows = await getCampaigns();
  const c = rows.find((x) => x.id === id);
  if (c) c.status = status;
  await write("campaigns",rows); if(!await getCurrentUser()) mock.mockCampaigns.splice(0,mock.mockCampaigns.length,...rows); return delay(c, 250);
};
export const saveCampaign = async (input: Pick<Campaign, "name" | "objective" | "budget"> & { id?: string }) => {
  if (input.id) {
    const rows = await getCampaigns();
  const c = rows.find((x) => x.id === input.id);
    if (c) Object.assign(c, input);
    await write("campaigns",rows); if(!await getCurrentUser()) mock.mockCampaigns.splice(0,mock.mockCampaigns.length,...rows); return delay(c, 300);
  }
  const c: Campaign = { ...input, id: uid(), status: "draft", spend: 0, impressions: 0, clicks: 0, results: 0, roas: 0, start: new Date().toISOString() };
  const rows = await getCampaigns(); rows.unshift(c);
  await write("campaigns",rows); if(!await getCurrentUser()) mock.mockCampaigns.splice(0,mock.mockCampaigns.length,...rows); return delay(c, 300);
};

// Leads
export const getLeads = () => read("leads",mock.mockLeads,[]);
export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  const rows = await getLeads(); const l = rows.find((x) => x.id === id);
  if (l) l.status = status;
  await write("leads",rows); if(!await getCurrentUser()) mock.mockLeads.splice(0,mock.mockLeads.length,...rows); return delay(l, 200);
};

// Analytics
export const getAnalytics = async (days: number) => (await read("analytics",mock.mockAnalytics,[])).slice(-days);

// Agent
export const getAgentHistory = () => read("history",mock.mockAgentHistory,[]);
export const getAgentActions = () => read<AgentAction[]>('actions',mock.mockActions,[]);
export const sendAgentMessage = async (text: string): Promise<AgentMessage> => {
 const lower=text.toLowerCase(); let body='I can prepare content, review campaigns, and suggest replies. Choose a request below.'; const actions=await getAgentActions(); const ids:string[]=[];
 if(/billing|permission|disconnect|account setting/.test(lower)) body='Only the account owner can change settings, permissions, connections or billing. I cannot perform those actions.';
 else if(/post|content|caption|idea/.test(lower)) { const post=await savePost({caption:text.includes('brunch')?mock.mockActions[0].body:'A fresh week, a fresh story. Discover what’s new at our business.',platform:'instagram',format:'feed',status:'pending',date:new Date(Date.now()+86400000).toISOString(),image:mock.mockPosts[0]?.image ?? ''}); if(post) {const action:AgentAction={id:uid(),kind:'post',title:'Your content draft',body:post.caption,targetId:post.id,image:post.image,status:'pending'}; actions.push(action);ids.push(action.id);body='Your draft is ready below. Review it and approve or reject it right here.';} }
 else if(/ad|campaign|budget|roas/.test(lower)) { const campaign=(await getCampaigns()).find(c=>c.status==='active'); if(campaign) {const action:AgentAction={id:uid(),kind:'budget',title:campaign.name,body:`Current daily budget $${campaign.budget}. Proposed $${Math.round(campaign.budget*1.2)}. This is a simulation; no Meta spend changes.`,targetId:campaign.id,amount:Math.round(campaign.budget*1.2),status:'pending'};actions.push(action);ids.push(action.id);body='Here is the campaign change for your review.';} else body='No campaigns connected yet. Create a draft campaign in Ads before requesting an optimization.'; }
 else if(/reply|inbox|dm|message/.test(lower)) { const conversation=(await getConversations()).find(c=>c.suggestedReply && canReply(c)); if(conversation) {const action:AgentAction={id:uid(),kind:'reply',title:conversation.name,body:conversation.suggestedReply ?? '',targetId:conversation.id,status:'pending'}; actions.push(action);ids.push(action.id);body='Review this reply to an existing inbound conversation before sending.';} else body='There are no inbound conversations waiting for a reply.'; }
 else if(/week|report|analytic|lead/.test(lower)) {const leads=await getLeads();const campaigns=await getCampaigns();body=`Your current pipeline has ${leads.length} opportunities and ${campaigns.length} campaigns. These are saved workspace records, not live Meta results.`;}
 await write('actions',actions); if(!await getCurrentUser()) mock.mockActions.splice(0,mock.mockActions.length,...actions);
 const msg:AgentMessage={id:uid(),role:'agent',text:body,time:new Date().toISOString(),actionIds:ids}; const history=await getAgentHistory();history.push({id:uid(),role:'user',text,time:new Date().toISOString()},msg); await write('history',history);if(!await getCurrentUser()) mock.mockAgentHistory.splice(0,mock.mockAgentHistory.length,...history);return delay(msg,500);
};
export async function resolveAgentAction(id:string,approved:boolean,amount?:number) { const w=await workspace();if(w?.paused) throw new Error('The agent is paused by an administrator');const actions=await getAgentActions();const action=actions.find(a=>a.id===id);if(!action || action.status!=='pending') return; if(!allowedAgentAction(action.kind)) throw new Error('Action not allowed');
 if(approved) { if(action.kind==='post') await updatePostStatus(action.targetId,'scheduled');if(action.kind==='reply') await sendReply(action.targetId,action.body);if(action.kind==='budget'){const c=await getCampaign(action.targetId);if(c) await saveCampaign({...c,budget:amount??action.amount??c.budget});} }
 action.status=approved?'approved':'rejected';await write('actions',actions);if(!await getCurrentUser()) mock.mockActions.splice(0,mock.mockActions.length,...actions);return action;
}
export async function addMedia(url:string,name:string) { const media=await getMediaLibrary();media.unshift({id:uid(),url,name,type:'image'});await write('media',media);if(!await getCurrentUser()) mock.mockMedia.splice(0,mock.mockMedia.length,...media); }

// Settings
export const getConnectedAccounts = () => read("accounts",mock.mockAccounts,mock.mockAccounts.map(a => ({...a,handle:"Not connected",connected:false})));
export const toggleAccountConnection = async (_id: string) => { throw new Error('Live Meta and WhatsApp connection requires provider setup. No account has been connected.'); };
export const getTeam = () => read("team",mock.mockTeam,[]);
export const inviteTeamMember = async (email: string) => {
  const m = { id: uid(), name: email.split("@")[0] ?? email, email, role: "Viewer" as const };
  const team=await getTeam();team.push(m);await write("team",team);if(!await getCurrentUser()) mock.mockTeam.push(m);
  return delay(m, 300);
};
