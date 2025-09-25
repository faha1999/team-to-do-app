import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function NotificationsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Notifications"
        description="Cross-channel notifications and inbox will live here soon."
      />
      <EmptyState
        title="Notification hub in progress"
        description="Connect web push and in-app alerts from the jobs runner to power this view."
      />
    </div>
  );
}
