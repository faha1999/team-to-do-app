import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type QuotePageProps = {
  params: { quoteId: string };
};

export default function QuoteDetailPage({ params }: QuotePageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Quote: ${params.quoteId}`}
        description="Render quote metadata, attribution, and sharing options."
      />
      <EmptyState
        title="Quote details pending"
        description="Bind this view to the quotes data source."
      />
    </div>
  );
}
