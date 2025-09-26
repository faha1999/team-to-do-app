"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Dialog, Transition } from "@headlessui/react";

import { createTask, removeTaskAttachment, updateTask, uploadTaskAttachments } from "@/server/actions/tasks";

const PRIORITY_OPTIONS = ["P1", "P2", "P3", "P4"] as const;
const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"] as const;
const REMINDER_CHANNELS = ["WEB", "PUSH", "EMAIL"] as const;

type UserOption = {
  id: string;
  name: string | null;
  email: string | null;
};

type LabelOption = {
  id: string;
  name: string;
  color: string;
};

type ReminderDraft = {
  id?: string;
  remindAt: string;
  channel: (typeof REMINDER_CHANNELS)[number];
};

type AttachmentRecord = {
  id: string;
  fileName: string;
  filePath: string;
  createdAt: string;
};

type SubtaskRecord = {
  id: string;
  title: string;
  status: (typeof STATUS_OPTIONS)[number];
};

type TaskPayload = {
  id: string;
  title: string;
  description: string | null;
  priority: (typeof PRIORITY_OPTIONS)[number];
  status: (typeof STATUS_OPTIONS)[number];
  startDate: string | null;
  dueDate: string | null;
  recurrenceRule: string | null;
  projectId: string | null;
  sectionId: string | null;
  assignments: { user: UserOption }[];
  labels: { label: LabelOption }[];
  reminders: ReminderDraft[];
  attachments: AttachmentRecord[];
  subtasks: (SubtaskRecord & { assignments: { user: UserOption }[]; labels: { label: LabelOption }[] })[];
};

type DraftState = {
  title: string;
  description: string;
  priority: (typeof PRIORITY_OPTIONS)[number];
  status: (typeof STATUS_OPTIONS)[number];
  startDate: string | null;
  dueDate: string | null;
  recurrenceRule: string | null;
  sectionId: string | null;
  assigneeIds: string[];
  labelIds: string[];
  reminders: ReminderDraft[];
  subtasks: SubtaskRecord[];
};

type TaskDrawerContextValue = {
  openTask: (taskId: string, trigger?: HTMLElement | null) => void;
};

const TaskDrawerContext = React.createContext<TaskDrawerContextValue | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
};

async function fetchTask(taskId: string) {
  const response = await fetch(`/api/tasks/${taskId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load task (${response.status})`);
  }
  return response.json() as Promise<{
    task: TaskPayload;
    availableUsers: UserOption[];
    availableLabels: LabelOption[];
  }>;
}

function toDraft(task: TaskPayload): DraftState {
  return {
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    recurrenceRule: task.recurrenceRule,
    sectionId: task.sectionId,
    assigneeIds: task.assignments.map((assignment) => assignment.user.id),
    labelIds: task.labels.map((item) => item.label.id),
    reminders: task.reminders.map((reminder) => ({ ...reminder })),
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      status: subtask.status,
    })),
  };
}

export function TaskDrawerProvider({ children }: ProviderProps) {
  const [open, setOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<TaskPayload | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [availableLabels, setAvailableLabels] = useState<LabelOption[]>([]);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const originRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setTaskId(null);
    setTaskData(null);
    setDraft(null);
    setError(null);
    setTimeout(() => {
      originRef.current?.focus();
      originRef.current = null;
    }, 10);
  }, []);

  const openTask = useCallback((id: string, trigger?: HTMLElement | null) => {
    originRef.current = trigger ?? null;
    setTaskId(id);
    setOpen(true);
  }, []);

  useEffect(() => {
    let active = true;
    if (!open || !taskId) return;

    setIsLoading(true);
    fetchTask(taskId)
      .then((payload) => {
        if (!active) return;
        setTaskData(payload.task);
        setAvailableUsers(payload.availableUsers);
        setAvailableLabels(payload.availableLabels);
        setDraft(toDraft(payload.task));
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, taskId]);

  const onFieldChange = useCallback(<K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }, []);

  const onReminderChange = useCallback(
    (index: number, reminder: Partial<ReminderDraft>) => {
      setDraft((current) => {
        if (!current) return current;
        const next = [...current.reminders];
        next[index] = { ...next[index], ...reminder } as ReminderDraft;
        return { ...current, reminders: next };
      });
    },
    []
  );

  const addReminder = useCallback(() => {
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1);
    setDraft((current) =>
      current
        ? {
            ...current,
            reminders: [
              ...current.reminders,
              {
                remindAt: defaultDate.toISOString(),
                channel: "WEB",
              },
            ],
          }
        : current
    );
  }, []);

  const removeReminder = useCallback((index: number) => {
    setDraft((current) => {
      if (!current) return current;
      const next = current.reminders.filter((_, idx) => idx !== index);
      return { ...current, reminders: next };
    });
  }, []);

  const onSubtaskChange = useCallback((index: number, updates: Partial<SubtaskRecord>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = [...current.subtasks];
      next[index] = { ...next[index], ...updates } as SubtaskRecord;
      return { ...current, subtasks: next };
    });
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!draft || !taskId) return;

      const payload = {
        id: taskId,
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        status: draft.status,
        startDate: draft.startDate,
        dueDate: draft.dueDate,
        recurrenceRule: draft.recurrenceRule,
        sectionId: draft.sectionId,
        assigneeIds: draft.assigneeIds,
        labelIds: draft.labelIds,
        reminders: draft.reminders.map((reminder) => ({
          ...reminder,
        })),
        subtasks: draft.subtasks,
      };

      startSubmitting(async () => {
        try {
          await updateTask(payload);
          const refreshed = await fetchTask(taskId);
          setTaskData(refreshed.task);
          setDraft(toDraft(refreshed.task));
          setAvailableUsers(refreshed.availableUsers);
          setAvailableLabels(refreshed.availableLabels);
          setError(null);
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Failed to save task");
        }
      });
    },
    [draft, taskId]
  );

  const handleAttachmentUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || !taskId) return;
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      startUploading(async () => {
        try {
          await uploadTaskAttachments(taskId, formData);
          const refreshed = await fetchTask(taskId);
          setTaskData(refreshed.task);
          setDraft(toDraft(refreshed.task));
          setAvailableUsers(refreshed.availableUsers);
          setAvailableLabels(refreshed.availableLabels);
        } catch (err) {
          console.error(err);
          setError("Failed to upload attachment");
        }
      });
    },
    [taskId]
  );

  const handleAttachmentRemove = useCallback((attachmentId: string) => {
    startUploading(async () => {
      try {
        await removeTaskAttachment(attachmentId);
        if (!taskId) return;
        const refreshed = await fetchTask(taskId);
        setTaskData(refreshed.task);
        setDraft(toDraft(refreshed.task));
        setAvailableUsers(refreshed.availableUsers);
        setAvailableLabels(refreshed.availableLabels);
      } catch (err) {
        console.error(err);
        setError("Failed to remove attachment");
      }
    });
  }, [taskId]);

  const handleCreateSubtask = useCallback(
    (title: string) => {
      if (!taskData) return;
      startSubmitting(async () => {
        try {
          await createTask({
            title,
            projectId: taskData.projectId,
            sectionId: taskData.sectionId,
            parentTaskId: taskData.id,
          });
          const refreshed = await fetchTask(taskData.id);
          setTaskData(refreshed.task);
          setDraft(toDraft(refreshed.task));
          setAvailableUsers(refreshed.availableUsers);
          setAvailableLabels(refreshed.availableLabels);
        } catch (err) {
          console.error(err);
          setError("Unable to create subtask");
        }
      });
    },
    [taskData]
  );

  const contextValue = useMemo<TaskDrawerContextValue>(() => ({ openTask }), [openTask]);

  const attachmentUrl = useCallback((attachment: AttachmentRecord) => {
    return `/api/attachments/${attachment.id}`;
  }, []);

  return (
    <TaskDrawerContext.Provider value={contextValue}>
      {children}
      <Transition show={open} as={Fragment}>
        <Dialog className="relative z-50" onClose={close} static>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-screen max-w-5xl rounded-3xl bg-white shadow-[0_30px_60px_rgba(15,17,21,0.16)]">
                  <form className="flex h-full flex-col" onSubmit={handleSubmit}>
                    <header className="flex items-center justify-between rounded-t-3xl border-b border-[#eadfd0] bg-[#fdf4ec] px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c0ad99]">
                          {taskData?.project?.name ?? "Inbox"}
                        </p>
                        <Dialog.Title className="text-sm font-medium text-[#8f7f6f]">
                          Task details
                        </Dialog.Title>
                        {error ? (
                          <p className="text-xs font-semibold text-[#d4522f]">{error}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={close}
                          className="rounded-full border border-[#eadfd0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7a6757] transition hover:bg-white"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="rounded-full bg-[#e05b37] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#c64c2b] disabled:opacity-60"
                          disabled={isSubmitting || isUploading || isLoading || !draft}
                        >
                          {isSubmitting ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-8 py-8">
                      {isLoading || !draft || !taskData ? (
                        <p className="text-sm text-slate-500">Loading task details…</p>
                      ) : (
                        <TaskDrawerContent
                          draft={draft}
                          taskData={taskData}
                          availableLabels={availableLabels}
                          availableUsers={availableUsers}
                          isSubmitting={isSubmitting}
                          isUploading={isUploading}
                          addReminder={addReminder}
                          removeReminder={removeReminder}
                          onReminderChange={onReminderChange}
                          onSubtaskChange={onSubtaskChange}
                          handleCreateSubtask={handleCreateSubtask}
                          onFieldChange={onFieldChange}
                          handleAttachmentUpload={handleAttachmentUpload}
                          handleAttachmentRemove={handleAttachmentRemove}
                          attachmentUrl={attachmentUrl}
                        />
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </TaskDrawerContext.Provider>
  );
}

export function useTaskDrawer() {
  const context = React.useContext(TaskDrawerContext);
  if (!context) {
    throw new Error("useTaskDrawer must be used within TaskDrawerProvider");
  }
  return context;
}

function toLocalInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

type TaskDrawerContentProps = {
  draft: DraftState;
  taskData: TaskPayload;
  availableLabels: LabelOption[];
  availableUsers: UserOption[];
  isSubmitting: boolean;
  isUploading: boolean;
  addReminder: () => void;
  removeReminder: (index: number) => void;
  onReminderChange: (index: number, reminder: Partial<ReminderDraft>) => void;
  onSubtaskChange: (index: number, updates: Partial<SubtaskRecord>) => void;
  handleCreateSubtask: (title: string) => void;
  onFieldChange: (key: keyof DraftState, value: DraftState[keyof DraftState]) => void;
  handleAttachmentUpload: (files: FileList | null) => void;
  handleAttachmentRemove: (attachmentId: string) => void;
  attachmentUrl: (attachment: AttachmentRecord) => string;
};

function TaskDrawerContent({
  draft,
  taskData,
  availableLabels,
  availableUsers,
  isSubmitting,
  isUploading,
  addReminder,
  removeReminder,
  onReminderChange,
  onSubtaskChange,
  handleCreateSubtask,
  onFieldChange,
  handleAttachmentUpload,
  handleAttachmentRemove,
  attachmentUrl,
}: TaskDrawerContentProps) {
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState(true);

  const completedSubtaskCount = useMemo(
    () => draft.subtasks.filter((subtask) => subtask.status === "DONE").length,
    [draft.subtasks]
  );
  const visibleSubtasks = useMemo(
    () =>
      draft.subtasks
        .map((subtask, index) => ({ subtask, index }))
        .filter(({ subtask }) => showCompletedSubtasks || subtask.status !== "DONE"),
    [draft.subtasks, showCompletedSubtasks]
  );
  const hiddenSubtaskCount = draft.subtasks.length - visibleSubtasks.length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-8">
        <section className="space-y-3">
          <input
            type="text"
            value={draft.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            className="w-full rounded-2xl border border-[#eadfd0] bg-[#fdf4ec] px-5 py-4 text-2xl font-semibold text-[#352c23] shadow-inner shadow-[#f7efe6] focus:border-[#d4522f] focus:outline-none"
          />
          <textarea
            value={draft.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full resize-none rounded-2xl border border-[#eadfd0] bg-white px-5 py-4 text-sm text-[#7a6757] focus:border-[#d4522f] focus:outline-none"
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-[#eadfd0] bg-[#fdf9f4] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#3c2f23]">
              <span>Sub-tasks</span>
              <span className="text-xs font-medium text-[#b39f8a]">
                {completedSubtaskCount}/{draft.subtasks.length}
              </span>
            </div>
            {draft.subtasks.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowCompletedSubtasks((current) => !current)}
                className="text-xs font-semibold text-[#d4522f]"
              >
                {showCompletedSubtasks ? "Hide completed" : "Show completed"}
                {hiddenSubtaskCount > 0 ? ` (${hiddenSubtaskCount})` : ""}
              </button>
            ) : null}
          </div>

          {visibleSubtasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#eadfd0] px-4 py-6 text-sm text-[#a18f7c]">
              Break this task into smaller steps to track progress.
            </p>
          ) : (
            <ul className="space-y-2">
              {visibleSubtasks.map(({ subtask, index }) => {
                const isDone = subtask.status === "DONE";
                const toggleStatus = () =>
                  onSubtaskChange(index, { status: isDone ? "OPEN" : "DONE" });

                return (
                  <li
                    key={subtask.id}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm shadow-[#f0e3d4]"
                  >
                    <button
                      type="button"
                      onClick={toggleStatus}
                      className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                        isDone
                          ? "border-[#d4522f] bg-[#d4522f] text-white"
                          : "border-[#eadfd0] text-transparent"
                      }`}
                      aria-label={isDone ? "Mark subtask as open" : "Mark subtask as done"}
                    >
                      {isDone ? (
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 12 4 4 8-8" />
                        </svg>
                      ) : null}
                    </button>
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(event) => onSubtaskChange(index, { title: event.target.value })}
                      className={`flex-1 border-none bg-transparent text-sm focus:outline-none ${
                        isDone ? "text-[#c8b8a6] line-through" : "text-[#3c2f23]"
                      }`}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          <AddSubtaskForm onCreate={handleCreateSubtask} disabled={isSubmitting} />
        </section>

        <section className="space-y-3 rounded-2xl border border-[#eadfd0] bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#3c2f23]">Attachments</h3>
            <label className="cursor-pointer rounded-full border border-[#eadfd0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7a6757]">
              {isUploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handleAttachmentUpload(event.target.files)}
              />
            </label>
          </div>
          {taskData.attachments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#eadfd0] px-4 py-6 text-sm text-[#a18f7c]">
              No files attached yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {taskData.attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center justify-between rounded-xl border border-[#eadfd0] bg-[#fdf9f4] px-4 py-3 text-sm"
                >
                  <a
                    href={attachmentUrl(attachment)}
                    className="text-[#3c2f23] underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {attachment.fileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleAttachmentRemove(attachment.id)}
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4522f]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <PropertyCard title="Project">
          <p className="text-sm text-[#3c2f23]">{taskData.project?.name ?? "Inbox"}</p>
          {taskData.section ? (
            <p className="text-xs text-[#a18f7c]">Section · {taskData.section.name}</p>
          ) : null}
        </PropertyCard>

        <PropertyCard title="Status">
          <select
            value={draft.status}
            onChange={(event) => onFieldChange("status", event.target.value as DraftState["status"])}
            className="w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </PropertyCard>

        <PropertyCard title="Priority">
          <select
            value={draft.priority}
            onChange={(event) => onFieldChange("priority", event.target.value as DraftState["priority"])}
            className="w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </PropertyCard>

        <PropertyCard title="Schedule">
          <label className="space-y-1 text-xs font-medium text-[#a18f7c]">
            Start
            <input
              type="datetime-local"
              value={draft.startDate ? toLocalInput(draft.startDate) : ""}
              onChange={(event) =>
                onFieldChange(
                  "startDate",
                  event.target.value ? new Date(event.target.value).toISOString() : null
                )
              }
              className="w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-[#a18f7c]">
            Due
            <input
              type="datetime-local"
              value={draft.dueDate ? toLocalInput(draft.dueDate) : ""}
              onChange={(event) =>
                onFieldChange(
                  "dueDate",
                  event.target.value ? new Date(event.target.value).toISOString() : null
                )
              }
              className="w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-[#a18f7c]">
            Recurrence
            <input
              type="text"
              placeholder="FREQ=WEEKLY;BYDAY=MO"
              value={draft.recurrenceRule ?? ""}
              onChange={(event) => onFieldChange("recurrenceRule", event.target.value || null)}
              className="w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
            />
          </label>
        </PropertyCard>

        <PropertyCard title="Assignees">
          <select
            multiple
            value={draft.assigneeIds}
            onChange={(event) =>
              onFieldChange(
                "assigneeIds",
                Array.from(event.target.selectedOptions).map((option) => option.value)
              )
            }
            className="h-32 w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
          >
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email ?? "Unknown"}
              </option>
            ))}
          </select>
        </PropertyCard>

        <PropertyCard title="Labels">
          <select
            multiple
            value={draft.labelIds}
            onChange={(event) =>
              onFieldChange(
                "labelIds",
                Array.from(event.target.selectedOptions).map((option) => option.value)
              )
            }
            className="h-32 w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
          >
            {availableLabels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        </PropertyCard>

        <PropertyCard title="Reminders">
          <button
            type="button"
            onClick={addReminder}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-dashed border-[#eadfd0] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4522f]"
          >
            + Add reminder
          </button>
          {draft.reminders.length === 0 ? (
            <p className="text-xs text-[#a18f7c]">No reminders configured.</p>
          ) : (
            <div className="space-y-3">
              {draft.reminders.map((reminder, index) => (
                <div key={reminder.id ?? index} className="space-y-2 rounded-xl border border-[#eadfd0] bg-[#fdf9f4] p-3">
                  <input
                    type="datetime-local"
                    value={toLocalInput(reminder.remindAt)}
                    onChange={(event) =>
                      onReminderChange(index, {
                        remindAt: new Date(event.target.value).toISOString(),
                      })
                    }
                    className="w-full rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={reminder.channel}
                      onChange={(event) =>
                        onReminderChange(index, {
                          channel: event.target.value as ReminderDraft["channel"],
                        })
                      }
                      className="flex-1 rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
                    >
                      {REMINDER_CHANNELS.map((channel) => (
                        <option key={channel} value={channel}>
                          {channel}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeReminder(index)}
                      className="rounded-full border border-[#eadfd0] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4522f]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PropertyCard>
      </aside>
    </div>
  );
}

function PropertyCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#eadfd0] bg-white p-5 shadow-sm shadow-[#f0e3d4]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b39f8a]">{title}</p>
      {children}
    </div>
  );
}

type AddSubtaskFormProps = {
  onCreate: (title: string) => void;
  disabled?: boolean;
};

function AddSubtaskForm({ onCreate, disabled }: AddSubtaskFormProps) {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isEditing]);

  const commit = () => {
    if (disabled) return;
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#d4522f]"
      >
        <span className="text-base">＋</span>
        Add sub-task
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="text"
        placeholder="Add subtask"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className="flex-1 rounded-lg border border-[#eadfd0] bg-white px-3 py-2 text-sm focus:border-[#d4522f] focus:outline-none"
      />
      <button
        type="button"
        className="rounded-full bg-[#e05b37] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:opacity-60"
        disabled={disabled}
        onClick={commit}
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => {
          setTitle("");
          setIsEditing(false);
        }}
        className="rounded-full border border-[#eadfd0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#7a6757]"
      >
        Cancel
      </button>
    </div>
  );
}
