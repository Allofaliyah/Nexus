
import "server-only";
import { getApiUser } from "./auth";

export async function requireAdmin(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: Response.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}
