import { createClient } from "./supabase";

export type ResourceType = "pricing" | "quality_report" | "quality_eval";
export type ActionType = "view" | "export" | "calculate" | "submit";

/**
 * Log access to sensitive resources for audit purposes.
 * Logs are stored in the access_logs table in Supabase.
 *
 * @param resourceType - Type of resource being accessed
 * @param resourceId - ID of the specific resource (e.g., project ID)
 * @param action - Action being performed
 * @param metadata - Optional additional data to log
 */
export async function logAccess(
  resourceType: ResourceType,
  resourceId: string,
  action: ActionType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("access_logs").insert({
      user_id: user.id,
      resource_type: resourceType,
      resource_id: resourceId,
      action,
      metadata: metadata || null,
    });
  } catch (error) {
    // Silently fail - logging should not break the app
    console.error("Failed to log access:", error);
  }
}
