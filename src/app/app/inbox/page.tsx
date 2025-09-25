import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { TaskItem } from "@/components/task/TaskItem";
import { QuickAdd } from "@/components/task/QuickAdd";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function InboxPage() {
  const user = await requireUser();

  const tasks = await prisma.task.findMany({
    where: {
      creatorId: user.id,
      projectId: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      section: true,
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inbox"
        actions={
          <div className="flex items-center gap-2 text-[#a18f7c]">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd0] bg-white text-sm"
              disabled
              aria-label="Edit project"
            >
              ✎
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd0] bg-white text-sm"
              disabled
              aria-label="Change layout"
            >
              ▤
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd0] bg-white text-base"
              disabled
              aria-label="More options"
            >
              …
            </button>
          </div>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="Zero inbox, zero stress"
          description="The moment something comes to mind, drop it here. We'll keep it safe until you schedule it."
          action={<QuickAdd userId={user.id} />}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#eadfd0] bg-white">
            <ul className="divide-y divide-[#f0e3d4]">
              {tasks.map((task) => (
                <li key={task.id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          </div>
          <QuickAdd userId={user.id} />
        </div>
      )}
    </div>
  );
}
