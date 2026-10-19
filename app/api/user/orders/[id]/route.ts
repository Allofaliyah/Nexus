
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders,
  orderStatusHistory,
  userActivity,
  notifications,
} from "@/lib/db/schema";
import { getApiUser } from "@/server/auth";
import { apiError, json, readJson, isRecord, isUuid } from "@/server/api-utils";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    if (!isUuid(id)) return apiError("Invalid order ID");

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, user.id)))
      .limit(1);

    if (!order) return apiError("Order not found", 404);
    return json({ order });
  } catch (error) {
    console.error("GET user order:", error);
    return apiError("Could not load order", 500);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    if (!isUuid(id)) return apiError("Invalid order ID");

    const body: unknown = await readJson(request);
    if (!isRecord(body) || body.action !== "cancel") {
      return apiError("Only the cancel action is supported");
    }

    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, id), eq(orders.userId, user.id)))
        .limit(1);

      if (!order) return { kind: "missing" as const };
      if (order.status !== "pending") {
        return { kind: "conflict" as const };
      }

      const [updated] = await tx
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(
          eq(orders.id, id),
          eq(orders.userId, user.id),
          eq(orders.status, "pending")
        ))
        .returning();

      if (!updated) return { kind: "conflict" as const };

      await tx.insert(orderStatusHistory).values({
        orderId: id,
        changedBy: user.id,
        previousStatus: order.status,
        newStatus: "cancelled",
        note: "Cancelled by user",
      });

      await tx.insert(userActivity).values({
        userId: user.id,
        action: "order_cancelled",
        description: "User cancelled a pending order",
        metadata: { orderId: id },
      });

      await tx.insert(notifications).values({
        userId: user.id,
        orderId: id,
        title: "Order cancelled",
        message: `Your order ${order.trackingNumber} has been cancelled.`,
      });

      return { kind: "success" as const, order: updated };
    });

    if (result.kind === "missing") {
      return apiError("Order not found", 404);
    }
    if (result.kind === "conflict") {
      return apiError("Only pending orders can be cancelled", 409);
    }

    return json({ message: "Order cancelled", order: result.order });
  } catch (error) {
    console.error("PATCH user order:", error);
    return apiError("Could not cancel order", 500);
  }
}
