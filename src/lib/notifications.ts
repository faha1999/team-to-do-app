export type NotificationPayload = {
  userId: string;
  type: "mention" | "assign" | "due" | "comment" | "status_change";
  data: Record<string, unknown>;
};

export async function queueNotification(payload: NotificationPayload) {
  // TODO: Persist notification and trigger delivery channels.
  console.info("Notification scheduled", payload);
}
