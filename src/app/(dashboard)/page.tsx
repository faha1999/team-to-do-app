import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { QuickAdd } from "@/components/task/QuickAdd";

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Today"
        description="Plan and focus on what needs your attention right now."
        actions={<QuickAdd />}
      />
      <EmptyState
        title="Nothing scheduled yet"
        description="Add tasks or pull work from projects to build your focus list."
      />
    </div>
  );
}
