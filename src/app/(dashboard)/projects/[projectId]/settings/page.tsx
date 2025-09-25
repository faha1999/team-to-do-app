import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type ProjectSettingsPageProps = {
  params: { projectId: string };
};

export default function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Project settings — ${params.projectId}`}
        description="Configure visibility, roles, and automations for this project."
      />
      <EmptyState
        title="Settings UI pending"
        description="Add forms for project metadata, visibility, and integrations."
      />
    </div>
  );
}
