import { PageHeader } from "@/components/layout/PageHeader";
import { MonthView } from "@/components/calendar/MonthView";

export default function MonthCalendarPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Calendar — Month"
        description="Review workload across the month."
      />
      <MonthView />
    </div>
  );
}
