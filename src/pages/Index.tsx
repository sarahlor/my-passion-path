import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>My Passion Path — Track Hobbies & Goals</title>
        <meta name="description" content="Organize hobbies, set goals, journal notes, and store resources. Clean, modern, and mobile‑first." />
        <link rel="canonical" href="/" />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center bg-background">
        <section className="text-center p-8 rounded-2xl border bg-card shadow-soft max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">Grow your passions</h1>
          <p className="text-lg text-muted-foreground mb-6">Track hobbies, set goals, add notes, and collect resources—all in one friendly place.</p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link to="/signup">Get started</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
