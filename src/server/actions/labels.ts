import { requireUser } from "@/lib/auth";

export async function createLabel(input: { name: string; color?: string }) {
  await requireUser();
  // TODO: persist label via Prisma.
  return { id: `label_${Date.now()}`, ...input };
}
