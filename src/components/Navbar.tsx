import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md transition-smooth ${
    isActive ? "bg-secondary text-foreground" : "hover:bg-secondary"
  }`;

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    };
    getSession();
    const { data: sub } = supabase.auth.onAuthStateChange(() => getSession());
    return () => {
      sub.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">My Passion Path</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <NavLink to="/dashboard" end className={navLinkCls}>
              Dashboard
            </NavLink>
            <NavLink to="/profile" end className={navLinkCls}>
              Profile
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground mr-2">{email}</span>
              <Button variant="secondary" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
