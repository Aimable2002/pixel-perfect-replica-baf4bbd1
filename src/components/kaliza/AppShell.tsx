import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Bot, Home, Inbox, LayoutGrid, Megaphone, Menu, Settings, Users, X, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AgentChat } from "./AgentChat";
import { KalizaMark } from "./common";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/content", label: "Content", icon: LayoutGrid },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/ads", label: "Ads", icon: Megaphone },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/agent", label: "Agent", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <KalizaMark />
        <span className="font-display text-lg font-semibold text-sidebar-accent-foreground">Kaliza</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link key={to} to={to} onClick={onNavigate}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
              <Icon className={cn("size-4", active && "text-sidebar-primary")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-accent-foreground">
          <MessageCircle className="size-4 text-sidebar-primary" /> WhatsApp control
        </div>
        <p className="mt-1 text-xs">Text or voice-note Kaliza any time. Connect it in Settings.</p>
      </div>
      <div className="flex items-center gap-3 border-t border-sidebar-border px-5 py-4">
        <div className="grid size-8 place-items-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">LV</div>
        <div className="text-xs">
          <p className="font-medium text-sidebar-accent-foreground">La Villa Bistro</p>
          <p>Pro plan</p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block"><SidebarNav /></aside>
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <SidebarNav onNavigate={() => setMobileNav(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu className="size-5" /></Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-success" /></span>
            Kaliza is active · handled 23 actions today
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">Sign out</Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {pathname !== "/agent" && !agentOpen && (
        <button onClick={() => setAgentOpen(true)}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-gradient-primary py-2.5 pl-2.5 pr-4 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:scale-105">
          <KalizaMark className="size-7 bg-none shadow-none" /> Ask Kaliza
        </button>
      )}
      <Sheet open={agentOpen} onOpenChange={setAgentOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md [&>button]:hidden">
          <SheetHeader className="flex-row items-center gap-3 space-y-0 border-b px-4 py-3">
            <KalizaMark className="size-7" />
            <SheetTitle className="text-base">Kaliza</SheetTitle>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setAgentOpen(false)} aria-label="Close"><X className="size-4" /></Button>
          </SheetHeader>
          <div className="min-h-0 flex-1"><AgentChat compact /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
