
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export type ApiUser = {
  id: string;
  email: string;
  role: "user" | "admin";
};

export async function getApiUser(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token || !supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  const [profile] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1);

  if (!profile) return null;

  return profile as ApiUser;
}
