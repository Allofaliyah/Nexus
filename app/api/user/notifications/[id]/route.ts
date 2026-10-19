
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getApiUser } from "@/server/auth";
import { apiError, json, isUuid } from "@/server/api-utils";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    if (!isUuid(id)) return apiError("Invalid notification ID");

    const [notification] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ))
      .returning();

    if (!notification) return apiError("Notification not found", 404);

    return json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("PATCH notification:", error);
    return apiError("Could not update notification", 500);
  }
}
