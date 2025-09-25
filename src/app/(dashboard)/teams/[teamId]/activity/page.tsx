import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type TeamActivityPageProps = {
  params: { teamId: string };
};

export default function TeamActivityPage({ params }: TeamActivityPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Team activity — ${params.teamId}`}
        description="Stream of significant events performed across the team."
      />
      <EmptyState
        title="No activity captured yet"
        description="Hook this page to the audit log once server actions are implemented."
      />
    </div>
  );
}
