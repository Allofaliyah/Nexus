

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderStatusHistory } from "@/lib/db/schema";
import { getApiUser } from "@/server/auth";
import { apiError, json } from "@/server/api-utils";

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const trackingNumber = new URL(request.url).searchParams.get("number");

    if (!trackingNumber || trackingNumber.length > 100) {
      return apiError("A valid tracking number is required");
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        eq(orders.trackingNumber, trackingNumber)
      ))
      .limit(1);

    if (!order) return apiError("Tracking number not found", 404);

    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, order.id))
      .orderBy(orderStatusHistory.createdAt);

    return json({ order, history });
  } catch (error) {
    console.error("GET tracking:", error);
    return apiError("Could not track order", 500);
  }
}
