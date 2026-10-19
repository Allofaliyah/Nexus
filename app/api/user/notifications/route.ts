
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getApiUser } from "@/server/auth";
import { apiError, json } from "@/server/api-utils";

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt));

    return json({
      notifications: result,
      unreadCount: result.filter((item) => !item.readAt).length,
    });
  } catch (error) {
    console.error("GET notifications:", error);
    return apiError("Could not load notifications", 500);
  }
}
