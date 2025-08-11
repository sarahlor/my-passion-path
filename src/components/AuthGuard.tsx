import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const has = !!data.session;
      setAuthed(has);
      setLoading(false);
      if (!has) navigate("/login", { replace: true, state: { from: location } });
    };
    check();
  }, [navigate, location]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!authed) return null;
  return <>{children}</>;
}
