export type ActivityEvent = {
  id: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  occurredAt: Date;
  diff?: unknown;
};

export async function logActivity(event: ActivityEvent) {
  // TODO: Persist to Prisma activity log table.
  console.info("Activity", event);
}
