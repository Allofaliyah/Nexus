
import { db } from "@/lib/db";
import { userActivity } from "@/lib/db/schema";
import { getApiUser } from "@/server/auth";
import { monitorSuccessfulLogins } from "@/server/security-monitor";
import { apiError, json } from "@/server/api-utils";

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);

    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    await db.insert(userActivity).values({
      userId: user.id,
      action: "login_success",
      description: "User signed in successfully",
      ipAddress,
      userAgent: request.headers.get("user-agent"),
      metadata: {},
    });

    // Run detection after the activity has been recorded.
    try {
      await monitorSuccessfulLogins(user.id);
    } catch (error) {
      // Monitoring failures must not undo the activity record.
      console.error("Login security monitoring failed:", error);
    }

    return json(
      { message: "Login activity recorded" },
      201
    );
  } catch (error) {
    console.error("Record login activity:", error);
    return apiError("Could not record login activity", 500);
  }
}
