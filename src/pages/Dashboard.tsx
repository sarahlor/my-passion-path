import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Hobby {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_url: string | null;
}

export default function Dashboard() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("hobbies")
        .select("id, user_id, title, description, category, cover_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) return;
      setHobbies(data ?? []);
    };
    load();
  }, []);

  const createHobby = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let cover_url: string | null = null;
    if (file) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { data: up, error: upErr } = await supabase.storage.from("hobby-covers").upload(path, file);
      if (upErr) {
        toast({ title: "Cover upload failed", description: upErr.message });
      } else {
        const { data: pub } = supabase.storage.from("hobby-covers").getPublicUrl(up.path);
        cover_url = pub.publicUrl;
      }
    }

    const { error } = await supabase.from("hobbies").insert({
      title,
      description,
      category: category || null,
      cover_url,
    });
    if (error) {
      toast({ title: "Create hobby failed", description: error.message });
    } else {
      toast({ title: "Hobby created" });
      setTitle("");
      setDescription("");
      setCategory("");
      setFile(null);
      // reload
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("hobbies")
        .select("id, user_id, title, description, category, cover_url")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      setHobbies(data ?? []);
    }
  };

  const filtered = useMemo(() => {
    return hobbies.filter((h) => {
      const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = !filter || (h.category ?? "").toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [hobbies, search, filter]);

  return (
    <>
      <Helmet>
        <title>Dashboard • My Passion Path</title>
        <meta name="description" content="Your hobbies dashboard: add, search, and manage hobbies." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>
      <div className="container mx-auto py-8">
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Add a new hobby</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createHobby} className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Fitness, Music" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover">Cover image (optional)</Label>
                  <Input id="cover" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit">Add Hobby</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Search & filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="search">Search by title</Label>
                  <Input id="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {[...new Set(hobbies.map((h) => h.category).filter(Boolean) as string[])].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <Card key={h.id} className="overflow-hidden hover:shadow-soft transition-smooth">
              {h.cover_url && (
                <img src={h.cover_url} alt={`${h.title} cover image`} className="h-40 w-full object-cover" loading="lazy" />
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{h.title}</span>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/hobby/${h.id}`}>Open</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{h.description}</p>
                {h.category && (
                  <div className="mt-3 text-xs text-muted-foreground">Category: {h.category}</div>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No hobbies yet. Create your first one above!</div>
          )}
        </div>
      </div>
    </>
  );
}
