import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("display_name").single();
      if (data?.display_name) setDisplayName(data.display_name);
    };
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ display_name: displayName });
    if (error) toast({ title: "Save failed", description: error.message });
    else toast({ title: "Profile saved" });
  };

  return (
    <>
      <Helmet>
        <title>Profile • My Passion Path</title>
        <meta name="description" content="Manage your profile details." />
        <link rel="canonical" href="/profile" />
      </Helmet>
      <div className="container mx-auto py-8">
        <Card className="max-w-xl shadow-soft">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Display name</Label>
                <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
