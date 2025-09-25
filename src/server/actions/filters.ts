import { requireUser } from "@/lib/auth";
import type { FilterQuery } from "@/lib/filters";

export async function saveFilter({ name, query }: { name: string; query: FilterQuery }) {
  const user = await requireUser();
  // TODO: persist filter and associate with user/team.
  return { id: `filter_${Date.now()}`, name, query, ownerId: user.id };
}
