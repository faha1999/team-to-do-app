import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function LabelsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Labels"
        description="Manage shared labels for cross-cutting task workflows."
      />
      <EmptyState
        title="No labels yet"
        description="Create labels to organize tasks by context, status, or workflow."
      />
    </div>
  );
}
