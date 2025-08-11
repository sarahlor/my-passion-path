import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message });
    } else {
      toast({ title: "Account created", description: "Welcome!" });
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign up • My Passion Path</title>
        <meta name="description" content="Create your account to track hobbies, goals, and resources." />
        <link rel="canonical" href="/signup" />
      </Helmet>
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-soft">
          <h1 className="text-2xl font-semibold mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-6">Start your passion path today.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="underline">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
