import {createFileRoute} from '@tanstack/react-router';
import {AppShell} from '@/components/kaliza/AppShell';
import {AgentChat} from '@/components/kaliza/AgentChat';
import {WhatsAppDemo} from '@/components/kaliza/WhatsAppDemo';
import {KalizaMark} from '@/components/kaliza/common';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/agent')({head:()=>pageHead('Your operator','Talk to Kaliza, review the work and approve proposals directly in your conversation.'),component:Agent});
function Agent(){return <AppShell><div className="mb-6"><p className="hud-label">A conversation, with outcomes</p><h1 className="mt-3 text-3xl font-semibold">Your operator.</h1></div><div className="grid gap-8 xl:grid-cols-[1fr_340px]"><div className="flex h-[760px] max-h-[calc(100dvh-180px)] min-h-[500px] flex-col overflow-hidden rounded-lg border bg-card"><div className="flex items-center gap-3 border-b px-5 py-4"><KalizaMark/><div><p className="text-sm font-semibold">Kaliza</p><p className="mt-1 text-[10px] text-muted-foreground">Drafts, decisions and next steps. Right here.</p></div><span className="ml-auto text-[10px] text-success">Ready</span></div><div className="min-h-0 flex-1"><AgentChat/></div></div><aside><p className="hud-label mb-4">WhatsApp companion / Demo</p><WhatsAppDemo/><div className="mt-6 border-t pt-5 text-xs leading-relaxed text-muted-foreground">Only inbound customer conversations can receive replies. Account settings, permissions and billing remain owner-controlled.</div></aside></div></AppShell>;}
