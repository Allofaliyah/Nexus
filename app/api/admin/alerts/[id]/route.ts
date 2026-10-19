
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { socAlerts, auditLogs } from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import {
  apiError,
  json,
  readJson,
  isRecord,
  isUuid,
} from "@/server/api-utils";

type Context = {
  params: Promise<{ id: string }>;
};

const validStatuses = ["acknowledged", "resolved"] as const;
type AlertStatus = (typeof validStatuses)[number];

export async function PATCH(
  request: Request,
  { params }: Context
) {
  try {
    const auth = await requireAdmin(request);

    if (auth.response) {
      return auth.response;
    }

    const { id } = await params;

    if (!isUuid(id)) {
      return apiError("Invalid alert ID", 400);
    }

    const body: unknown = await readJson(request);

    if (
      !isRecord(body) ||
      typeof body.status !== "string" ||
      !validStatuses.includes(body.status as AlertStatus)
    ) {
      return apiError(
        "Status must be acknowledged or resolved",
        400
      );
    }

    const status = body.status as AlertStatus;

    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(socAlerts)
        .where(eq(socAlerts.id, id))
        .limit(1);

      if (!current) {
        return null;
      }

      const [updated] = await tx
        .update(socAlerts)
        .set({
          status,
          acknowledgedBy:
            status === "acknowledged"
              ? auth.user!.id
              : current.acknowledgedBy,
          resolvedAt:
            status === "resolved"
              ? new Date()
              : current.resolvedAt,
        })
        .where(eq(socAlerts.id, id))
        .returning();

      await tx.insert(auditLogs).values({
        actorId: auth.user!.id,
        action: `soc_alert_${status}`,
        resourceType: "soc_alert",
        resourceId: updated.id,
        details: {
          previousStatus: current.status,
          newStatus: updated.status,
        },
      });

      return updated;
    });

    if (!result) {
      return apiError("Alert not found", 404);
    }

    return json({
      message: `Alert ${status} successfully`,
      alert: result,
    });
  } catch (error) {
    console.error("PATCH alert:", error);
    return apiError("Could not update alert", 500);
  }
}
