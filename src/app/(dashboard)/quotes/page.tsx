import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function QuotesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Inspirational quotes"
        description="Optional module for daily motivation."
      />
      <EmptyState
        title="No quotes yet"
        description="Connect to a data source or create your own library."
      />
    </div>
  );
}
