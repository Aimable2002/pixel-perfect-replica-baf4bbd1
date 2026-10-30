import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/kaliza/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Kaliza" },
      { name: "description", content: "Log in to your Kaliza dashboard." },
      { property: "og:title", content: "Log in — Kaliza" },
      { property: "og:description", content: "Log in to your Kaliza dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see what Kaliza has been up to.">
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setLoading(true);
        await login(String(f.get("email")), String(f.get("password")));
        nav({ to: "/" });
      }}>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required defaultValue="clement@kaliza.app" /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required defaultValue="demo1234" /></div>
        <Button className="w-full" disabled={loading}>{loading ? "Logging in…" : "Log in"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">New to Kaliza? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}
