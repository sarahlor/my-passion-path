import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Goal { id: string; title: string; description: string | null; target_date: string | null; progress: number; }
interface Note { id: string; content: string; created_at: string; }
interface Resource { id: string; type: string; url: string | null; file_url: string | null; title: string | null; }

export default function HobbyBoard() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data: goals } = await supabase.from("goals").select("id, title, description, target_date, progress").eq("hobby_id", id).order("created_at", { ascending: false });
      setGoals(goals ?? []);
      const { data: notes } = await supabase.from("notes").select("id, content, created_at").eq("hobby_id", id).order("created_at", { ascending: false });
      setNotes(notes ?? []);
      const { data: resources } = await supabase.from("resources").select("id, type, url, file_url, title").eq("hobby_id", id).order("created_at", { ascending: false });
      setResources(resources ?? []);
    };
    load();
  }, [id]);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { error } = await supabase.from("goals").insert({
      hobby_id: id,
      title,
      description: goalDesc || null,
      target_date: targetDate || null,
      progress,
    });
    if (error) return toast({ title: "Add goal failed", description: error.message });
    setTitle(""); setGoalDesc(""); setTargetDate(""); setProgress(0);
    const { data } = await supabase.from("goals").select("id, title, description, target_date, progress").eq("hobby_id", id).order("created_at", { ascending: false });
    setGoals(data ?? []);
  };

  const updateGoalProgress = async (goalId: string, value: number) => {
    const { error } = await supabase.from("goals").update({ progress: value }).eq("id", goalId);
    if (error) toast({ title: "Update failed", description: error.message });
    else setGoals((g) => g.map((it) => (it.id === goalId ? { ...it, progress: value } : it)));
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (error) toast({ title: "Delete failed", description: error.message });
    else setGoals((g) => g.filter((it) => it.id !== goalId));
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { error } = await supabase.from("notes").insert({ hobby_id: id, content: note });
    if (error) return toast({ title: "Add note failed", description: error.message });
    setNote("");
    const { data } = await supabase.from("notes").select("id, content, created_at").eq("hobby_id", id).order("created_at", { ascending: false });
    setNotes(data ?? []);
  };

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    let file_url: string | null = null;
    if (resourceFile) {
      const path = `${crypto.randomUUID()}-${resourceFile.name}`;
      const { data: up, error: upErr } = await supabase.storage.from("resources").upload(path, resourceFile);
      if (upErr) return toast({ title: "Upload failed", description: upErr.message });
      const { data: pub } = supabase.storage.from("resources").getPublicUrl(up.path);
      file_url = pub.publicUrl;
    }
    const { error } = await supabase.from("resources").insert({
      hobby_id: id,
      title: resourceTitle || null,
      url: resourceUrl || null,
      file_url,
      type: resourceFile ? "file" : "link",
    });
    if (error) return toast({ title: "Add resource failed", description: error.message });
    setResourceTitle(""); setResourceUrl(""); setResourceFile(null);
    const { data } = await supabase.from("resources").select("id, type, url, file_url, title").eq("hobby_id", id).order("created_at", { ascending: false });
    setResources(data ?? []);
  };

  return (
    <>
      <Helmet>
        <title>Hobby Board • My Passion Path</title>
        <meta name="description" content="Goals, notes, and resources for your hobby." />
      </Helmet>
      <div className="container mx-auto py-8">
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader><CardTitle>Add Goal</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={addGoal} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="gtitle">Title</Label>
                    <Input id="gtitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="gdesc">Description</Label>
                    <Input id="gdesc" value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Target date</Label>
                    <Input id="date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress %</Label>
                    <Input id="progress" type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit">Add Goal</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((g) => (
                <Card key={g.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-base">{g.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{g.description}</p>
                    <Progress value={g.progress} className="mb-3" />
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} max={100} value={g.progress} onChange={(e) => updateGoalProgress(g.id, Number(e.target.value))} />
                      <Button variant="secondary" onClick={() => deleteGoal(g.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {goals.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">No goals yet.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader><CardTitle>Add Note</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={addNote} className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-3">
                    <Input placeholder="Write a note..." value={note} onChange={(e) => setNote(e.target.value)} required />
                  </div>
                  <div>
                    <Button type="submit" className="w-full">Add</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              {notes.map((n) => (
                <Card key={n.id} className="shadow-soft">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">{new Date(n.created_at).toLocaleString()}</div>
                    <div>{n.content}</div>
                  </CardContent>
                </Card>
              ))}
              {notes.length === 0 && (
                <div className="text-center text-muted-foreground">No notes yet.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader><CardTitle>Add Resource</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={addResource} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rtitle">Title</Label>
                    <Input id="rtitle" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rurl">Link (YouTube, article, etc.)</Label>
                    <Input id="rurl" value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="rfile">Upload file (optional)</Label>
                    <Input id="rfile" type="file" onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit">Add Resource</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <Card key={r.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-base">{r.title || r.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {r.url && (
                      <a className="underline" href={r.url} target="_blank" rel="noreferrer">Open link</a>
                    )}
                    {r.file_url && (
                      <div className="mt-2">
                        <a className="underline" href={r.file_url} target="_blank" rel="noreferrer">Download file</a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {resources.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">No resources yet.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
