
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders,
  profiles,
  orderStatusHistory,
  notifications,
  userActivity,
  auditLogs,
} from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import {
  apiError, json, readJson, isRecord, isUuid,
} from "@/server/api-utils";

type Context = { params: Promise<{ id: string }> };

const statuses = [
  "pending", "confirmed", "in_transit",
  "delivered", "cancelled", "failed",
] as const;

export async function PATCH(request: Request, { params }: Context) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const { id } = await params;
    if (!isUuid(id)) return apiError("Invalid order ID");

    const body: unknown = await readJson(request);
    if (!isRecord(body) ||
        typeof body.status !== "string" ||
        !statuses.includes(body.status as typeof statuses[number])) {
      return apiError("A valid order status is required");
    }

    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);

      if (!current) return { kind: "missing" as const };

      const nextStatus = body.status as typeof statuses[number];

      if (current.status === nextStatus) {
        return { kind: "unchanged" as const, order: current };
      }

      const [updated] = await tx
        .update(orders)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(and(
          eq(orders.id, id),
          eq(orders.status, current.status)
        ))
        .returning();

      if (!updated) return { kind: "conflict" as const };

      const note =
        typeof body.note === "string" ? body.note.slice(0, 1000) : null;

      await tx.insert(orderStatusHistory).values({
        orderId: id,
        changedBy: auth.user!.id,
        previousStatus: current.status,
        newStatus: nextStatus,
        note,
      });

      await tx.insert(notifications).values({
        userId: current.userId,
        orderId: id,
        title: "Order status updated",
        message: `Your order ${current.trackingNumber} is now ${nextStatus.replace("_", " ")}.`,
      });

      await tx.insert(userActivity).values({
        userId: auth.user!.id,
        action: "admin_order_status_changed",
        description: `Changed order status to ${nextStatus}`,
        metadata: { orderId: id, previousStatus: current.status, nextStatus },
      });

      await tx.insert(auditLogs).values({
        actorId: auth.user!.id,
        action: "order_status_changed",
        resourceType: "order",
        resourceId: id,
        details: { previousStatus: current.status, nextStatus },
      });

      return { kind: "success" as const, order: updated };
    });

    if (result.kind === "missing") return apiError("Order not found", 404);
    if (result.kind === "conflict") {
      return apiError("Order changed concurrently; reload and retry", 409);
    }

    return json({
      message: result.kind === "unchanged" ? "Status unchanged" : "Order updated",
      order: result.order,
    });
  } catch (error) {
    console.error("PATCH admin order:", error);
    return apiError("Could not update order", 500);
  }
}
