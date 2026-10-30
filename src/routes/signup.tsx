import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/kaliza/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Kaliza" },
      { name: "description", content: "Create your Kaliza account and put your Meta presence on autopilot." },
      { property: "og:title", content: "Sign up — Kaliza" },
      { property: "og:description", content: "Create your Kaliza account." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Create your account" subtitle="Set up takes about 3 minutes.">
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setLoading(true);
        await signup(String(f.get("name")), String(f.get("email")), String(f.get("password")));
        nav({ to: "/onboarding" });
      }}>
        <div className="space-y-2"><Label htmlFor="name">Business name</Label><Input id="name" name="name" required placeholder="La Villa Bistro" /></div>
        <div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" name="email" type="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={8} required /></div>
        <Button className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link></p>
    </AuthLayout>
  );
}
