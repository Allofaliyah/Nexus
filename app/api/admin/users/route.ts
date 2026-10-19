
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import { apiError, json } from "@/server/api-utils";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);

    if (auth.response) {
      return auth.response;
    }

    const users = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        role: profiles.role,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .orderBy(desc(profiles.createdAt));

    return json({ users });
  } catch (error) {
    console.error("GET admin users:", error);
    return apiError("Could not load users", 500);
  }
}
