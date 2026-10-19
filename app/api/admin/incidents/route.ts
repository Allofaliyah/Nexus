
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { socIncidents } from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import { apiError, json } from "@/server/api-utils";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);

    if (auth.response) {
      return auth.response;
    }

    const incidents = await db
      .select()
      .from(socIncidents)
      .orderBy(desc(socIncidents.createdAt));

    return json({ incidents });
  } catch (error) {
    console.error("GET incidents:", error);
    return apiError("Could not load incidents", 500);
  }
}
