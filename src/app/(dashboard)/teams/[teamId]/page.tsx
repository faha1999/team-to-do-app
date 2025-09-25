import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type TeamPageProps = {
  params: { teamId: string };
};

export default function TeamOverviewPage({ params }: TeamPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Team: ${params.teamId}`}
        description="Overview of members, visibility, and active projects."
      />
      <EmptyState
        title="Team dashboard coming soon"
        description="Surface project summaries, activity, and quick actions."
      />
    </div>
  );
}
