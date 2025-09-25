import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function InboxPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Inbox"
        description="Capture tasks quickly before organizing them into projects."
      />
      <EmptyState
        title="Inbox zero"
        description="Add new tasks or import items to get started."
      />
    </div>
  );
}
