// Temporary Supabase stub to keep the app running until Supabase is connected.
// Once you connect Supabase (click the green Supabase button in Lovable),
// this file will be auto-generated and this stub will be replaced.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = {
  auth: {
    async getUser() {
      return { data: { user: null }, error: null };
    },
    async getSession() {
      return { data: { session: null }, error: null };
    },
    async signInWithPassword() {
      return { data: null, error: { message: "Supabase not connected" } };
    },
    async signUp() {
      return { data: null, error: { message: "Supabase not connected" } };
    },
    async signOut() {
      return { error: null };
    },
    onAuthStateChange(cb: () => void) {
      // no-op subscription stub
      return { data: { subscription: { unsubscribe: () => undefined } } } as const;
    },
  },
  from(_table: string) {
    const chain = {
      select: () => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      eq: () => chain,
      order: () => chain,
      insert: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      upsert: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
    };
    return chain;
  },
  storage: {
    from(_bucket: string) {
      return {
        upload: async () => ({ data: null, error: { message: "Supabase not connected" } }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: "" } }),
      };
    },
  },
};
