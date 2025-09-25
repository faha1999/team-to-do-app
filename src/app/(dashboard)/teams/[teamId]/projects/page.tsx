import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type TeamProjectsPageProps = {
  params: { teamId: string };
};

export default function TeamProjectsPage({ params }: TeamProjectsPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Projects — ${params.teamId}`}
        description="List public and private projects for this team."
      />
      <EmptyState
        title="No projects yet"
        description="Create projects to start collaborating with teammates."
      />
    </div>
  );
}
