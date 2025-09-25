import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/project/Section";
import { TaskItem } from "@/components/task/TaskItem";

type ProjectPageProps = {
  params: { projectId: string };
};

export default function ProjectListView({ params }: ProjectPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Project: ${params.projectId}`}
        description="List view groups tasks by section for rapid triage."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Backlog">
          <TaskItem title="Set up project structure" />
          <TaskItem title="Invite teammates" />
        </Section>
        <Section title="In progress">
          <TaskItem title="Design calendar view" status="in_progress" />
        </Section>
      </div>
    </div>
  );
}
