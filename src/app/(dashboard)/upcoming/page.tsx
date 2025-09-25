import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function UpcomingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Upcoming"
        description="Preview tasks scheduled for the next few weeks."
      />
      <EmptyState
        title="No upcoming tasks"
        description="Schedule due dates to visualize work across the calendar."
      />
    </div>
  );
}
