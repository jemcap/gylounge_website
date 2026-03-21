import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/app/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase";

export const createBrowserSupabaseClient = () =>
  createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
