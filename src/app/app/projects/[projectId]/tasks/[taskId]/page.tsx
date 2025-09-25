import Link from "next/link";
import { notFound } from "next/navigation";

import { BadgeCheck, CalendarDays, Clock, FileText, Users } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Not scheduled";
  return format(value, "EEE, dd MMM yyyy · hh:mm a");
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_TONES: Record<string, string> = {
  OPEN: "bg-slate-200 text-slate-900",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  BLOCKED: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default async function TaskFocusView({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = await params;
  const user = await requireUser();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
      reminders: true,
      attachments: true,
      subtasks: {
        include: {
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task || task.projectId !== projectId) {
    notFound();
  }

  const membership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId: user.id,
    },
  });

  const isOwner = task.project?.ownerUserId === user.id;
  const hasAccess = isOwner || membership;

  if (!hasAccess) {
    notFound();
  }

  const statusTone = STATUS_TONES[task.status] ?? "bg-slate-200 text-slate-900";
  const statusLabel = STATUS_LABELS[task.status] ?? task.status;

  const primaryAssignees = task.assignments.map((assignment) => assignment.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6f8] via-[#f1f2f5] to-[#e6e8ed]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="rounded-3xl border border-white/40 bg-white/80 p-10 shadow-[0_20px_45px_-25px_rgba(15,17,21,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                {task.project?.team?.name ?? "Personal Workspace"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                {task.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
                Craft the narrative that guides every touchpoint. This focus view distills the brief, timeline,
                collaborators, and supporting assets so the team can execute with conviction.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${statusTone}`}>
                {statusLabel}
              </span>
              <Link
                href={`/app/projects/${projectId}`}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-500"
              >
                Back to project
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_16px_40px_-30px_rgba(15,17,21,0.5)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                <BadgeCheck className="h-4 w-4 text-slate-400" /> Mission outline
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-700">
                {task.description ?? "Detail the messaging pillars, tone, and elevator narrative that align teams behind the launch."}
              </p>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_16px_40px_-30px_rgba(15,17,21,0.5)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                <Clock className="h-4 w-4 text-slate-400" /> Schedule
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Start</dt>
                  <dd className="mt-2 text-sm font-medium text-slate-800">
                    {formatDateTime(task.startDate)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Due</dt>
                  <dd className="mt-2 text-sm font-medium text-slate-800">
                    {formatDateTime(task.dueDate)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Recurrence</dt>
                  <dd className="mt-2 text-sm font-medium text-slate-800">
                    {task.recurrenceRule ?? "One-time"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Reminders</dt>
                  <dd className="mt-2 space-y-1 text-sm font-medium text-slate-800">
                    {task.reminders.length === 0
                      ? "None configured"
                      : task.reminders.map((reminder) => (
                          <p key={reminder.id}>
                            {formatDateTime(reminder.remindAt)} · {reminder.channel}
                          </p>
                        ))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_16px_40px_-30px_rgba(15,17,21,0.5)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                <FileText className="h-4 w-4 text-slate-400" /> Subtasks & checkpoints
              </h2>
              {task.subtasks.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No subtasks yet. Iterate from the Task Drawer to break work down.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {task.subtasks.map((subtask) => {
                    const tone = STATUS_TONES[subtask.status] ?? "bg-slate-200 text-slate-900";
                    const label = STATUS_LABELS[subtask.status] ?? subtask.status;
                    return (
                      <li
                        key={subtask.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">{subtask.title}</p>
                          {subtask.assignments.length > 0 ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {subtask.assignments
                                .map((assignment) => assignment.user.name ?? assignment.user.email ?? "Contributor")
                                .join(", ")}
                            </p>
                          ) : null}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${tone}`}>
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-[0_16px_40px_-30px_rgba(15,17,21,0.5)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                <CalendarDays className="h-4 w-4 text-slate-400" /> Supporting assets
              </h2>
              {task.attachments.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No files have been attached yet. Upload artifacts from the Task Drawer.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {task.attachments.map((attachment) => (
                    <Link
                      key={attachment.id}
                      href={`/api/attachments/${attachment.id}`}
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      <span>{attachment.fileName}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-800">
                        Download
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/90 p-8 shadow-[0_16px_40px_-30px_rgba(15,17,21,0.5)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                <Users className="h-4 w-4 text-slate-400" /> Collaborators
              </h2>
              <ul className="mt-4 space-y-3">
                {primaryAssignees.length === 0 ? (
                  <li className="text-sm text-slate-500">No primary assignees yet.</li>
                ) : (
                  primaryAssignees.map((member) => (
                    <li key={member.id} className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-semibold uppercase text-white">
                        {(member.name ?? member.email ?? "").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{member.name ?? "Teammate"}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/40 bg-slate-950/95 p-8 text-white shadow-[0_16px_40px_-30px_rgba(15,17,21,0.7)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
                Launch readiness
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Align messaging across the product story, marketing, and enablement. Once approved, publish the framework
                to your release kit and notify partner teams straight from Team To-Do.
              </p>
              <Link
                href={`/app/projects/${projectId}/board`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-900 transition hover:bg-slate-200"
              >
                View launch board
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
