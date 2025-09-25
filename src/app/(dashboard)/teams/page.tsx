import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function TeamsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Teams"
        description="Switch between teams, review membership, and create new spaces."
      />
      <EmptyState
        title="No teams yet"
        description="Create a team to collaborate with others."
      />
    </div>
  );
}
