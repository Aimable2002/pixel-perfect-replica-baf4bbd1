import {createFileRoute} from '@tanstack/react-router';
import {BadgeCheck,Lock,Settings,MoreVertical} from 'lucide-react';
import {Link} from '@tanstack/react-router';
import {AppShell} from '@/components/kaliza/AppShell';
import {AgentChat} from '@/components/kaliza/AgentChat';
import {WhatsAppDemo} from '@/components/kaliza/WhatsAppDemo';
import {KalizaMark} from '@/components/kaliza/common';
import {Button} from '@/components/ui/button';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/agent')({head:()=>pageHead('Your operator','Talk to Kaliza, review the work and approve proposals directly in your conversation.'),component:Agent});
function Agent(){return <AppShell><div className="grid gap-8 2xl:grid-cols-[1fr_340px]"><div className="flex h-[calc(100dvh-170px)] min-h-[520px] flex-col overflow-hidden rounded-xl border bg-card">
<header className="flex items-center gap-3 border-b px-4 py-3">
<div className="relative"><KalizaMark className="size-10"/><span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success"/></div>
<div className="min-w-0"><p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">Kaliza<BadgeCheck className="size-4 text-success"/><span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">AI Operator</span><span className="hidden items-center gap-1 text-[10px] font-normal text-success sm:flex"><span className="size-1.5 rounded-full bg-success"/>Connected</span></p><p className="mt-0.5 truncate text-[11px] text-success">Direct sync with Workspace<span className="hidden text-muted-foreground sm:inline"> · High Autonomy Mode</span></p></div>
<div className="ml-auto flex items-center gap-1"><span className="hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] text-muted-foreground md:flex"><Lock className="size-3 text-success"/>Owner-controlled actions</span><Button asChild variant="ghost" size="icon" aria-label="Settings"><Link to="/settings"><Settings className="size-4"/></Link></Button><Button variant="ghost" size="icon" aria-label="More"><MoreVertical className="size-4"/></Button></div>
</header>
<div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 text-[11px] sm:hidden"><span className="size-1.5 rounded-full bg-primary"/><span className="font-medium">Live Companion Session</span><span className="text-muted-foreground">· High Autonomy</span><span className="ml-auto rounded border border-success/40 px-1.5 py-0.5 text-[10px] text-success">Connected</span></div>
<div className="min-h-0 flex-1"><AgentChat/></div></div>
<aside className="hidden 2xl:block"><p className="hud-label mb-4">WhatsApp companion / Demo</p><WhatsAppDemo/><div className="mt-6 border-t pt-5 text-xs leading-relaxed text-muted-foreground">Voice and calls happen in WhatsApp. Only inbound customer conversations can receive replies.</div></aside></div></AppShell>;}
