import { notFound } from "next/navigation";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";

export default async function FilterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();

  if (!id) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Filter · ${id}`}
        description="Saved filters will soon render live task results with full query transparency."
      />
      <EmptyState
        title="Filter execution coming soon"
        description="Connect this view to prisma.savedFilter once the query engine and builder are wired up."
      />
    </div>
  );
}
