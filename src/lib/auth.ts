export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "ADMIN" | "MEMBER";
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  // TODO: Integrate with NextAuth credentials provider.
  return null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
