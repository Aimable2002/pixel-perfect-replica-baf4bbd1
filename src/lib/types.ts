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
export interface AgentMessage { id: string; role: "user" | "agent"; text: string; time: string }
export interface TeamMember { id: string; name: string; email: string; role: "Owner" | "Editor" | "Viewer" }
export interface ConnectedAccount { id: string; name: string; handle: string; connected: boolean }
