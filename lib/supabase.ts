import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/database";

export const getSupabaseUrl = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";

  if (!supabaseUrl) {
    throw new Error("Supabase URL must be provided");
  }

  return supabaseUrl;
};

export const getSupabaseAnonKey = () => {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!supabaseKey) {
    throw new Error("Supabase anon or publishable key must be provided");
  }

  return supabaseKey;
};

const getSupabaseServiceRoleKey = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseServiceRoleKey) {
    throw new Error("Supabase service role key must be provided");
  }

  return supabaseServiceRoleKey;
};

export const supabaseClient = () => {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
};

export const supabaseAdminClient = () => {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
