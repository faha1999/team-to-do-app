import { PageHeader, EmptyState } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Workspace settings"
        description="Manage personal preferences, notifications, and connected services."
      />
      <EmptyState
        title="Settings dashboard coming soon"
        description="Hook up NextAuth account management and preference toggles to configure delivery."
      />
    </div>
  );
}
