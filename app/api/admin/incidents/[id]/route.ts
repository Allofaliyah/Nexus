
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  socIncidents,
  profiles,
  auditLogs,
} from "@/lib/db/schema";
import { requireAdmin } from "@/server/admin-auth";
import {
  apiError,
  json,
  readJson,
  isRecord,
  isUuid,
} from "@/server/api-utils";

const statuses = [
  "open",
  "investigating",
  "contained",
  "resolved",
  "closed",
] as const;

type IncidentStatus = (typeof statuses)[number];

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const auth = await requireAdmin(request);

    if (auth.response) return auth.response;

    const { id } = await context.params;

    if (!isUuid(id)) {
      return apiError("Invalid incident ID", 400);
    }

    const body: unknown = await readJson(request);

    if (!isRecord(body)) {
      return apiError("Invalid JSON body", 400);
    }

    const hasStatus = "status" in body;
    const hasAssignee = "assignedTo" in body;
    const hasResolution = "resolution" in body;

    if (!hasStatus && !hasAssignee && !hasResolution) {
      return apiError("No incident fields provided to update", 400);
    }

    const updates: {
      status?: IncidentStatus;
      assignedTo?: string | null;
      resolution?: string | null;
      updatedAt: Date;
      resolvedAt?: Date | null;
    } = {
      updatedAt: new Date(),
    };

    if (hasStatus) {
      if (
        typeof body.status !== "string" ||
        !statuses.includes(body.status as IncidentStatus)
      ) {
        return apiError("Invalid incident status", 400);
      }

      updates.status = body.status as IncidentStatus;

      updates.resolvedAt =
        body.status === "resolved" || body.status === "closed"
          ? new Date()
          : null;
    }

    if (hasAssignee) {
      if (
        body.assignedTo !== null &&
        (typeof body.assignedTo !== "string" ||
          !isUuid(body.assignedTo))
      ) {
        return apiError("Invalid assignee ID", 400);
      }

      const assignedTo = body.assignedTo as string | null;

      if (assignedTo) {
        const [assignee] = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.id, assignedTo))
          .limit(1);

        if (!assignee) {
          return apiError("Assignee not found", 400);
        }
      }

      updates.assignedTo = assignedTo;
    }

    if (hasResolution) {
      if (
        body.resolution !== null &&
        typeof body.resolution !== "string"
      ) {
        return apiError(
          "Resolution must be a string or null",
          400
        );
      }

      const resolution = body.resolution as string | null;

      if (resolution !== null && resolution.length > 10000) {
        return apiError("Resolution is too long", 400);
      }

      updates.resolution = resolution?.trim() || null;
    }

    const result = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(socIncidents)
        .where(eq(socIncidents.id, id))
        .limit(1);

      if (!existing) return null;

      const [updated] = await tx
        .update(socIncidents)
        .set(updates)
        .where(eq(socIncidents.id, id))
        .returning();

      await tx.insert(auditLogs).values({
        actorId: auth.user!.id,
        action: "soc_incident_updated",
        resourceType: "soc_incident",
        resourceId: updated.id,
        details: {
          changes: {
            ...(updates.status !== undefined && {
              status: {
                from: existing.status,
                to: updated.status,
              },
            }),
            ...(updates.assignedTo !== undefined && {
              assignedTo: {
                from: existing.assignedTo,
                to: updated.assignedTo,
              },
            }),
            ...(updates.resolution !== undefined && {
              resolutionUpdated: true,
            }),
          },
        },
      });

      return updated;
    });

    if (!result) {
      return apiError("Incident not found", 404);
    }

    return json({
      message: "Incident updated successfully",
      incident: result,
    });
  } catch (error) {
    console.error("PATCH incident:", error);
    return apiError("Could not update incident", 500);
  }
}
