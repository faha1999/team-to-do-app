import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LabelsPage() {
  const user = await requireUser();

  const labels = await prisma.label.findMany({
    where: {
      OR: [
        { team: { members: { some: { userId: user.id } } } },
        { teamId: null },
      ],
    },
    include: {
      team: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Labels"
        description="Apply consistent context and create saved views across projects."
      />

      {labels.length === 0 ? (
        <EmptyState
          title="No labels yet"
          description="Create labels directly from tasks to categorise by effort, rituals, or squads."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-5 py-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{label.name}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {label.team ? label.team.name : "Personal"}
                </p>
              </div>
              <span
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: label.color }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
