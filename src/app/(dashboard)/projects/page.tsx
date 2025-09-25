import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="View and manage all personal and team projects."
      />
      <EmptyState
        title="No projects"
        description="Create a project to group tasks and collaborate."
      />
    </div>
  );
}
