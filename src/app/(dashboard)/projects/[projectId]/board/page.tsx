import { PageHeader } from "@/components/layout/PageHeader";
import { BoardColumn } from "@/components/project/BoardColumn";
import { TaskItem } from "@/components/task/TaskItem";

type ProjectBoardPageProps = {
  params: { projectId: string };
};

export default function ProjectBoardView({ params }: ProjectBoardPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Board — ${params.projectId}`}
        description="Kanban board surfaces work across customizable columns."
      />
      <div className="flex gap-4 overflow-x-auto">
        <BoardColumn title="To do">
          <TaskItem title="Build add-task modal" />
        </BoardColumn>
        <BoardColumn title="In progress">
          <TaskItem title="Implement server actions" status="in_progress" />
        </BoardColumn>
        <BoardColumn title="Done">
          <TaskItem title="Create project scaffolding" status="done" />
        </BoardColumn>
      </div>
    </div>
  );
}
