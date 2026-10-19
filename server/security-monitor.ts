
import "server-only";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  userActivity,
  socAlerts,
  socIncidents,
  auditLogs,
} from "@/lib/db/schema";

const LOGIN_WINDOW_MINUTES = 5;
const LOGIN_THRESHOLD = 5;

export async function monitorSuccessfulLogins(userId: string) {
  return db.transaction(async (tx) => {
    // Prevent concurrent checks for the same user from creating
    // duplicate alerts at the same time.
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${userId})::bigint)`
    );

    const since = new Date(
      Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000
    );

    const [result] = await tx
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(userActivity)
      .where(
        and(
          eq(userActivity.userId, userId),
          eq(userActivity.action, "login_success"),
          gte(userActivity.createdAt, since)
        )
      );

    if (Number(result?.count ?? 0) < LOGIN_THRESHOLD) {
      return { alertCreated: false, reason: "threshold_not_reached" };
    }

    // Do not create another alert while an earlier one is unresolved.
    const [existingAlert] = await tx
      .select({ id: socAlerts.id })
      .from(socAlerts)
      .where(
        and(
          eq(socAlerts.userId, userId),
          eq(socAlerts.source, "login_monitor"),
          inArray(socAlerts.status, ["new", "acknowledged"])
        )
      )
      .limit(1);

    if (existingAlert) {
      return { alertCreated: false, reason: "alert_already_exists" };
    }

    const [alert] = await tx
      .insert(socAlerts)
      .values({
        userId,
        title: "Unusually frequent successful logins",
        description:
          `The user signed in at least ${LOGIN_THRESHOLD} times ` +
          `within ${LOGIN_WINDOW_MINUTES} minutes.`,
        severity: "medium",
        status: "new",
        source: "login_monitor",
        metadata: {
          event: "frequent_successful_logins",
          windowMinutes: LOGIN_WINDOW_MINUTES,
          threshold: LOGIN_THRESHOLD,
        },
      })
      .returning();

    const [incident] = await tx
      .insert(socIncidents)
      .values({
        alertId: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
      })
      .returning();

    await tx.insert(auditLogs).values({
      actorId: userId,
      action: "soc_incident_auto_created",
      resourceType: "soc_incident",
      resourceId: incident.id,
      details: {
        alertId: alert.id,
        reason: "frequent_successful_logins",
      },
    });

    return {
      alertCreated: true,
      alertId: alert.id,
      incidentId: incident.id,
    };
  });
}
