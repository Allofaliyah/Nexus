
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import { apiError, json, isUuid } from "@/server/api-utils";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);

    if (auth.response) {
      return auth.response;
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const actorId = url.searchParams.get("actorId");

    const limit = limitParam === null ? 50 : Number(limitParam);
    const offset = offsetParam === null ? 0 : Number(offsetParam);

    if (
      !Number.isInteger(limit) ||
      !Number.isInteger(offset) ||
      limit < 1 ||
      limit > 100 ||
      offset < 0
    ) {
      return apiError(
        "Limit must be 1–100 and offset must be non-negative",
        400
      );
    }

    if (actorId && !isUuid(actorId)) {
      return apiError("Invalid actor ID", 400);
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(actorId ? eq(auditLogs.actorId, actorId) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return json({
      logs,
      limit,
      offset,
    });
  } catch (error) {
    console.error("GET audit logs:", error);
    return apiError("Could not load audit logs", 500);
  }
}
