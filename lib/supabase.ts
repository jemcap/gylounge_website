import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be provided");
  }
  return createClient<Database>(supabaseUrl, supabaseKey);
};

export const supabaseAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase URL and Service Role Key must be provided");
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
