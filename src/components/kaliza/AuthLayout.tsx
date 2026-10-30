import type { ReactNode } from "react";
import { KalizaMark } from "./common";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-hero p-12 text-sidebar-accent-foreground lg:flex">
        <div className="flex items-center gap-2.5"><KalizaMark /><span className="font-display text-lg font-semibold">Kaliza</span></div>
        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-tight">Your brand on Instagram & Facebook, run by an agent you text.</h2>
          <p className="mt-4 max-w-md text-sidebar-foreground">Content, comments, DMs, Meta Ads and leads — handled around the clock. Steer it from WhatsApp or right here.</p>
        </div>
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/70 p-4 text-sm">
          <p className="text-sidebar-foreground">WhatsApp · 08:02</p>
          <p className="mt-1">“Replied to 14 comments, found 2 hot leads, paused 1 weak ad. Want next week's post ideas?”</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden"><KalizaMark /><span className="font-display text-lg font-semibold">Kaliza</span></div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
