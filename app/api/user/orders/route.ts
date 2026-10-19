
import { randomBytes } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders,
  userActivity,
  orderStatusHistory,
} from "@/lib/db/schema";
import { getApiUser } from "@/server/auth";
import {
  apiError,
  json,
  readJson,
  isRecord,
} from "@/server/api-utils";

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    return json({ orders: result });
  } catch (error) {
    console.error("GET user orders:", error);
    return apiError("Could not load orders", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const body: unknown = await readJson(request);
    if (!isRecord(body)) return apiError("Invalid JSON body");

    const {
      recipientName,
      recipientPhone,
      pickupAddress,
      deliveryAddress,
      packageType,
      description,
    } = body;

    if (
      typeof recipientName !== "string" ||
      !recipientName.trim() ||
      typeof recipientPhone !== "string" ||
      !recipientPhone.trim() ||
      typeof pickupAddress !== "string" ||
      !pickupAddress.trim() ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim() ||
      typeof packageType !== "string" ||
      !packageType.trim()
    ) {
      return apiError(
        "Recipient, phone, pickup, delivery and package type are required"
      );
    }

    if (
      recipientName.length > 255 ||
      recipientPhone.length > 30 ||
      pickupAddress.length > 5000 ||
      deliveryAddress.length > 5000 ||
      packageType.length > 100 ||
      (description !== undefined &&
        description !== null &&
        (typeof description !== "string" ||
          description.length > 5000))
    ) {
      return apiError("One or more fields are too long");
    }

    const trackingNumber =
      "NXS-" + randomBytes(6).toString("hex").toUpperCase();

    const created = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId: user.id,
          trackingNumber,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          pickupAddress: pickupAddress.trim(),
          deliveryAddress: deliveryAddress.trim(),
          packageType: packageType.trim(),
          description:
            typeof description === "string"
              ? description.trim()
              : null,
          status: "pending",
        })
        .returning();

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        changedBy: user.id,
        previousStatus: null,
        newStatus: "pending",
        note: "Order created",
      });

      await tx.insert(userActivity).values({
        userId: user.id,
        action: "order_created",
        description: "User created a logistics order",
        metadata: { orderId: order.id },
      });

      return order;
    });

    return json({ message: "Order created", order: created }, 201);
  } catch (error) {
    console.error("POST user orders:", error);
    return apiError("Could not create order", 500);
  }
}
