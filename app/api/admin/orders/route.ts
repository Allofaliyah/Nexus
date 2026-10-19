
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import { apiError, json } from "@/server/api-utils";

const allowedStatuses = [
  "pending", "confirmed", "in_transit",
  "delivered", "cancelled", "failed",
] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const status = new URL(request.url).searchParams.get("status");

    if (status && !allowedStatuses.includes(status as typeof allowedStatuses[number])) {
      return apiError("Invalid order status");
    }

    const result = status
      ? await db.select().from(orders)
          .where(eq(orders.status, status as typeof allowedStatuses[number]))
          .orderBy(desc(orders.createdAt))
      : await db.select().from(orders)
          .orderBy(desc(orders.createdAt));

    return json({ orders: result });
  } catch (error) {
    console.error("GET admin orders:", error);
    return apiError("Could not load orders", 500);
  }
}
