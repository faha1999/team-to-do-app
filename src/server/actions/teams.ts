import { requireUser } from "@/lib/auth";
import { canManageTeam, assertPermission } from "@/lib/permissions";

export async function inviteMember(teamId: string, email: string) {
  const user = await requireUser();
  assertPermission(canManageTeam("ADMIN"), `${user.id} cannot invite members`);
  // TODO: create invite record and send notification.
  return { teamId, email };
}
