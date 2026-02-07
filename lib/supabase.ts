import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be provided");
  }
  return createClient(supabaseUrl, supabaseKey);
};
