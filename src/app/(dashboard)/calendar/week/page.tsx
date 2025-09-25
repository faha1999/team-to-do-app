import { PageHeader } from "@/components/layout/PageHeader";
import { WeekView } from "@/components/calendar/WeekView";

export default function WeekCalendarPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Calendar — Week"
        description="Plan workload across the current week."
      />
      <WeekView />
    </div>
  );
}
