import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type FilterPageProps = {
  params: { id: string };
};

export default function FilterDetailPage({ params }: FilterPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Filter: ${params.id}`}
        description="Render tasks that match the saved criteria."
      />
      <EmptyState
        title="No tasks match"
        description="Once filters are connected to the database they will display matching tasks."
      />
    </div>
  );
}
