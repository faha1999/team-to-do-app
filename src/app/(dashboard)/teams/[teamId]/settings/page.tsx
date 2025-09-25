import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

type TeamSettingsPageProps = {
  params: { teamId: string };
};

export default function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Team settings — ${params.teamId}`}
        description="Control roles, invitations, and workspace configuration."
      />
      <EmptyState
        title="Settings UI pending"
        description="Add forms for invite policies, defaults, and retention rules."
      />
    </div>
  );
}
