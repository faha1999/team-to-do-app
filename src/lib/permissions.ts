export type Role = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
export type ProjectRole = "ADMIN" | "EDITOR" | "COMMENTER" | "VIEWER";

export function canManageTeam(role: Role) {
  return role === "OWNER" || role === "ADMIN";
}

export function canEditProject(role: ProjectRole) {
  return role === "ADMIN" || role === "EDITOR";
}

export function assertPermission(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}
