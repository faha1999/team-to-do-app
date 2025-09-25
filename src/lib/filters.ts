export type FilterQuery = {
  projects?: string[];
  labels?: string[];
  priority?: Array<"P1" | "P2" | "P3" | "P4">;
  due?: { op: "on" | "before" | "after" | "onOrBefore" | "onOrAfter"; date: string };
  assigneeId?: string;
  status?: Array<"OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED">;
};

export function buildWhereClause(filter: FilterQuery) {
  // TODO: Convert to Prisma-compatible where clause.
  return { filter };
}
