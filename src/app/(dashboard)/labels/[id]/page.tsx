import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type LabelPageProps = {
  params: { id: string };
};

export default function LabelDetailPage({ params }: LabelPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Label: ${params.id}`}
        description="Display tasks and analytics related to this label."
      />
      <EmptyState
        title="Label has no tasks"
        description="Once tasks are assigned this page will list them."
      />
    </div>
  );
}
