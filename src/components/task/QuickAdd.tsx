"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { addDays, format, setHours, setMinutes, startOfDay } from "date-fns";

import { createTask } from "@/server/actions/tasks";

function toLocalIsoDate(dateValue: string): string | null {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 17, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function formatDateLabel(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "d MMM");
}

function formatDateInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

export type QuickAddProjectOption = {
  id: string;
  name: string;
};

type TaskPriorityValue = "P1" | "P2" | "P3" | "P4";
type ReminderChannelValue = "WEB" | "PUSH" | "EMAIL";

type ReminderDraft = {
  id: string;
  remindAt: string;
  channel: ReminderChannelValue;
};

const PRIORITY_OPTIONS: Array<{ value: TaskPriorityValue; label: string; accent: string }> = [
  { value: "P1", label: "Priority 1", accent: "text-[#d4522f]" },
  { value: "P2", label: "Priority 2", accent: "text-[#dc6927]" },
  { value: "P3", label: "Priority 3", accent: "text-[#b85d2a]" },
  { value: "P4", label: "Priority 4", accent: "text-[#8f7f6f]" },
];

const REMINDER_CHANNEL_OPTIONS: Array<{ value: ReminderChannelValue; label: string }> = [
  { value: "WEB", label: "In-app" },
  { value: "PUSH", label: "Push" },
  { value: "EMAIL", label: "Email" },
];

type QuickAddProps = {
  projectId?: string;
  sectionId?: string;
  projects?: QuickAddProjectOption[];
  userId?: string;
};

function CalendarIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={4} y={5} width={16} height={15} rx={2.5} />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M8 11.5h8" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 4.5v15" />
      <path d="M7 4.5h9.5a1 1 0 0 1 .9 1.45l-1.4 2.8a1 1 0 0 0 0 .9l1.4 2.8a1 1 0 0 1-.9 1.45H7" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 16.5H6l1.2-1.5a3 3 0 0 0 .6-1.8V11a4.2 4.2 0 0 1 3.8-4.2 4 4 0 0 1 4.4 4v2.9a3 3 0 0 0 .6 1.8z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <circle cx={6} cy={12} r={1.2} />
      <circle cx={12} cy={12} r={1.2} />
      <circle cx={18} cy={12} r={1.2} />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.75 9.5 6 4.75h12l1.25 4.75" />
      <path d="M4 9.5v7.75A2.75 2.75 0 0 0 6.75 20h10.5A2.75 2.75 0 0 0 20 17.25V9.5" />
      <path d="M4 13.5h3.9c.27 1.36 1.45 2.4 2.85 2.4s2.58-1.04 2.85-2.4H18" />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M4.5 7.5h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 16.5h8" />
      <path d="M6.5 4v3.5" />
      <path d="M12 4v3.5" />
      <path d="M17.5 4v3.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M6.5 9.5 12 15l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m5.5 12.5 4 3.5 9-8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuickAdd({ projectId, sectionId, projects, userId }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [projectOptions, setProjectOptions] = useState<QuickAddProjectOption[]>(projects ?? []);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId ?? null);
  const [projectQuery, setProjectQuery] = useState("");
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [priority, setPriority] = useState<TaskPriorityValue>("P3");
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [reminders, setReminders] = useState<ReminderDraft[]>([]);
  const [isRemindersMenuOpen, setIsRemindersMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = useMemo(() => (userId ? `quickAdd:lastProject:${userId}` : null), [userId]);

  useEffect(() => {
    setProjectOptions(projects ?? []);
  }, [projects]);

  useEffect(() => {
    if (projectId !== undefined) {
      setSelectedProjectId(projectId ?? null);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId !== undefined) return;
    if (!storageKey) return;
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setSelectedProjectId(stored === "__INBOX__" ? null : stored);
    }
  }, [projectId, storageKey]);

  useEffect(() => {
    if (projectId !== undefined) return;
    if (!storageKey) return;
    if (typeof window === "undefined") return;

    if (selectedProjectId === null) {
      window.localStorage.setItem(storageKey, "__INBOX__");
    } else {
      window.localStorage.setItem(storageKey, selectedProjectId);
    }
  }, [selectedProjectId, storageKey, projectId]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setError(null);
    setProjectQuery("");
    setIsProjectMenuOpen(false);
    setIsDateMenuOpen(false);
    setIsPriorityMenuOpen(false);
    setIsRemindersMenuOpen(false);
    setDueDate(null);
    setPriority("P3");
    setReminders([]);
    if (projectId !== undefined) {
      setSelectedProjectId(projectId ?? null);
    }
  }, [projectId]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        resetForm();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsExpanded(false);
        resetForm();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isExpanded, resetForm]);

  useEffect(() => {
    if (!isExpanded) return;
    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [isExpanded]);

  const ensureProjectsLoaded = useCallback(async () => {
    if (projects && projects.length > 0) {
      return;
    }

    if (projectOptions.length > 0 || isLoadingProjects) {
      return;
    }

    try {
      setIsLoadingProjects(true);
      const response = await fetch("/api/projects/quick-list", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      const payload = (await response.json()) as { projects: QuickAddProjectOption[] };
      setProjectOptions(payload.projects);
      setProjectsError(null);
    } catch (err) {
      console.error(err);
      setProjectsError("Unable to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  }, [projectOptions.length, isLoadingProjects, projects]);

  useEffect(() => {
    if (isExpanded) {
      void ensureProjectsLoaded();
    }
  }, [isExpanded, ensureProjectsLoaded]);

  const selectedProjectName = useMemo(() => {
    if (!selectedProjectId) {
      return "Inbox";
    }
    return projectOptions.find((project) => project.id === selectedProjectId)?.name ?? "Select project";
  }, [selectedProjectId, projectOptions]);

  const dueDateLabel = useMemo(() => formatDateLabel(dueDate) ?? "Date", [dueDate]);
  const dateInputValue = useMemo(() => formatDateInput(dueDate), [dueDate]);

  const priorityLabel = useMemo(() => {
    const detail = PRIORITY_OPTIONS.find((option) => option.value === priority);
    return detail ? detail.label : "Priority";
  }, [priority]);

  const priorityAccent = useMemo(() => {
    return PRIORITY_OPTIONS.find((option) => option.value === priority)?.accent ?? "text-[#7a6757]";
  }, [priority]);

  const remindersLabel = useMemo(() => {
    return reminders.length > 0 ? `Reminders (${reminders.length})` : "Reminders";
  }, [reminders.length]);

  const toggleDateMenu = () => {
    setIsDateMenuOpen((current) => {
      const next = !current;
      if (next) {
        setIsPriorityMenuOpen(false);
        setIsRemindersMenuOpen(false);
        setIsProjectMenuOpen(false);
      }
      return next;
    });
  };

  const togglePriorityMenu = () => {
    setIsPriorityMenuOpen((current) => {
      const next = !current;
      if (next) {
        setIsDateMenuOpen(false);
        setIsRemindersMenuOpen(false);
        setIsProjectMenuOpen(false);
      }
      return next;
    });
  };

  const toggleRemindersMenu = () => {
    setIsRemindersMenuOpen((current) => {
      const next = !current;
      if (next) {
        setIsDateMenuOpen(false);
        setIsPriorityMenuOpen(false);
        setIsProjectMenuOpen(false);
      }
      return next;
    });
  };

  const selectQuickDate = (offsetDays: number) => {
    const base = setMinutes(setHours(startOfDay(new Date()), 17), 0);
    const target = addDays(base, offsetDays);
    setDueDate(target.toISOString());
    setIsDateMenuOpen(false);
  };

  const clearDueDate = () => {
    setDueDate(null);
    setIsDateMenuOpen(false);
  };

  const handleCustomDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const iso = toLocalIsoDate(value);
    if (iso) {
      setDueDate(iso);
    } else {
      setDueDate(null);
    }
  };

  const handlePrioritySelect = (value: TaskPriorityValue) => {
    setPriority(value);
    setIsPriorityMenuOpen(false);
  };

  const handleAddReminder = () => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    let baseDate = dueDate ? new Date(dueDate) : new Date();
    if (Number.isNaN(baseDate.getTime())) {
      baseDate = new Date();
    }
    const initialValue = format(baseDate, "yyyy-MM-dd'T'HH:mm");
    setReminders((current) => [
      ...current,
      {
        id,
        remindAt: initialValue,
        channel: "WEB",
      },
    ]);
  };

  const handleReminderChange = (id: string, patch: Partial<Omit<ReminderDraft, "id">>) => {
    setReminders((current) =>
      current.map((reminder) => (reminder.id === id ? { ...reminder, ...patch } : reminder))
    );
  };

  const handleReminderRemove = (id: string) => {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  };

  const filteredProjects = useMemo(() => {
    if (!projectQuery.trim()) {
      return projectOptions;
    }
    const query = projectQuery.trim().toLowerCase();
    return projectOptions.filter((project) => project.name.toLowerCase().includes(query));
  }, [projectOptions, projectQuery]);

  const handleOpen = () => {
    setIsExpanded(true);
  };

  const handleCancel = useCallback(() => {
    resetForm();
    setIsExpanded(false);
  }, [resetForm]);

  const handleProjectToggle = () => {
    if (!isProjectMenuOpen) {
      setIsDateMenuOpen(false);
      setIsPriorityMenuOpen(false);
      setIsRemindersMenuOpen(false);
      void ensureProjectsLoaded();
    }
    setIsProjectMenuOpen((current) => !current);
  };

  const handleProjectSelect = (id: string | null) => {
    setSelectedProjectId(id);
    setIsProjectMenuOpen(false);
    if (projectId === undefined && storageKey && typeof window !== "undefined") {
      if (id === null) {
        window.localStorage.setItem(storageKey, "__INBOX__");
      } else {
        window.localStorage.setItem(storageKey, id);
      }
    }
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Add a task title to continue");
      return;
    }

    const dueDatePayload = dueDate && !Number.isNaN(new Date(dueDate).getTime()) ? dueDate : undefined;
    const remindersPayload = reminders
      .map((reminder) => {
        if (!reminder.remindAt) return null;
        const parsed = new Date(reminder.remindAt);
        if (Number.isNaN(parsed.getTime())) return null;
        return {
          remindAt: parsed.toISOString(),
          channel: reminder.channel,
        };
      })
      .filter(Boolean) as { remindAt: string; channel: ReminderChannelValue }[];

    startTransition(async () => {
      try {
        await createTask({
          title: trimmedTitle,
          description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
          projectId: selectedProjectId ?? undefined,
          sectionId:
            selectedProjectId && projectId && selectedProjectId === projectId ? sectionId ?? undefined : undefined,
          dueDate: dueDatePayload,
          priority,
          reminders: remindersPayload,
        });
        resetForm();
        setIsExpanded(false);
      } catch (err) {
        console.error(err);
        setError("Unable to create task");
      }
    });
  }

  const anchorId = projectId ? undefined : "quick-add";

  if (!isExpanded) {
    return (
      <div id={anchorId}>
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#e05b37] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c64c2b]"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-base leading-none">+</span>
          Add task
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-20" ref={containerRef} id={anchorId}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl border border-[#eadfd0] bg-white px-6 py-4 shadow-[0_24px_48px_rgba(206,180,152,0.2)]"
      >
        <div className="space-y-3">
          <div>
            <input
              ref={titleInputRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task name"
              className="w-full border-none bg-transparent text-base font-semibold text-[#3c2f23] placeholder:text-[#b9a896] focus:outline-none"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              rows={2}
              className="mt-1 w-full resize-none border-none bg-transparent text-sm text-[#7a6757] placeholder:text-[#c8b8a6] focus:outline-none"
            />
          </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={toggleDateMenu}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                dueDate
                  ? "border-[#d4522f] bg-[#fce9e1] text-[#d4522f]"
                  : "border-[#eadfd0] bg-[#fdf4ec] text-[#7a6757] hover:bg-[#f7efe6]"
              }`}
            >
              <CalendarIcon />
              {dueDate ? dueDateLabel : "Date"}
            </button>
            {isDateMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-60 rounded-xl border border-[#eadfd0] bg-white p-3 shadow-[0_18px_36px_rgba(196,164,133,0.28)]">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => selectQuickDate(0)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#6d5a4c] transition hover:bg-[#fdf4ec]"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => selectQuickDate(1)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#6d5a4c] transition hover:bg-[#fdf4ec]"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => selectQuickDate(7)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#6d5a4c] transition hover:bg-[#fdf4ec]"
                  >
                    Next week
                  </button>
                </div>
                <div className="mt-3 border-t border-[#f0e3d4] pt-3">
                  <label className="flex flex-col gap-2 text-xs text-[#b39f8a]">
                    Custom date
                    <input
                      type="date"
                      value={dateInputValue}
                      onChange={handleCustomDateChange}
                      className="rounded-md border border-[#eadfd0] bg-[#fdf4ec] px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
                    />
                  </label>
                </div>
                {dueDate ? (
                  <button
                    type="button"
                    onClick={clearDueDate}
                    className="mt-3 w-full rounded-md border border-[#eadfd0] px-3 py-2 text-sm text-[#7a6757] transition hover:bg-[#fdf4ec]"
                  >
                    Clear date
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={togglePriorityMenu}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                priority !== "P3"
                  ? `border-[#eadfd0] bg-[#fce9e1] ${priorityAccent}`
                  : "border-[#eadfd0] bg-[#fdf4ec] text-[#7a6757] hover:bg-[#f7efe6]"
              }`}
            >
              <FlagIcon />
              {priority !== "P3" ? priorityLabel : "Priority"}
            </button>
            {isPriorityMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-48 rounded-xl border border-[#eadfd0] bg-white p-2 shadow-[0_18px_36px_rgba(196,164,133,0.28)]">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePrioritySelect(option.value)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-[#fdf4ec] ${
                      option.value === priority ? option.accent : "text-[#6d5a4c]"
                    }`}
                  >
                    {option.label}
                    {option.value === priority ? <CheckIcon /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={toggleRemindersMenu}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                reminders.length > 0
                  ? "border-[#d4522f] bg-[#fce9e1] text-[#d4522f]"
                  : "border-[#eadfd0] bg-[#fdf4ec] text-[#7a6757] hover:bg-[#f7efe6]"
              }`}
            >
              <BellIcon />
              {remindersLabel}
            </button>
            {isRemindersMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-xl border border-[#eadfd0] bg-white p-3 shadow-[0_18px_36px_rgba(196,164,133,0.28)]">
                {reminders.length === 0 ? (
                  <p className="rounded-md bg-[#fdf4ec] px-3 py-2 text-xs text-[#a18f7c]">
                    No reminders yet. Add one to get a gentle ping.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="space-y-2 rounded-lg border border-[#eadfd0] bg-[#fdf4ec] p-3">
                        <input
                          type="datetime-local"
                          value={reminder.remindAt}
                          onChange={(event) =>
                            handleReminderChange(reminder.id, { remindAt: event.target.value })
                          }
                          className="w-full rounded-md border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={reminder.channel}
                            onChange={(event) =>
                              handleReminderChange(reminder.id, {
                                channel: event.target.value as ReminderChannelValue,
                              })
                            }
                            className="flex-1 rounded-md border border-[#eadfd0] bg-white px-3 py-2 text-sm text-[#3c2f23] focus:border-[#d4522f] focus:outline-none"
                          >
                            {REMINDER_CHANNEL_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleReminderRemove(reminder.id)}
                            className="rounded-md border border-[#eadfd0] px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7a6757] transition hover:bg-[#f7efe6]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAddReminder}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#eadfd0] px-3 py-2 text-sm font-medium text-[#d4522f] transition hover:bg-[#fdf4ec]"
                >
                  + Add reminder
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#eadfd0] bg-[#fdf4ec] px-3 py-1.5 text-xs font-semibold text-[#7a6757]"
            disabled
          >
            <DotsIcon />
          </button>
        </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0e3d4] pt-4">
          <div className="relative">
            <button
              type="button"
              onClick={handleProjectToggle}
              className="inline-flex items-center gap-2 rounded-md border border-[#eadfd0] bg-[#fdf4ec] px-3 py-1.5 text-sm font-medium text-[#7a6757] transition hover:bg-[#f7efe6]"
            >
              {selectedProjectId ? <ProjectIcon /> : <InboxIcon />}
              {selectedProjectName}
              <ChevronDownIcon />
            </button>

            {isProjectMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-[#eadfd0] bg-white p-3 shadow-[0_18px_36px_rgba(196,164,133,0.28)]">
                <div className="mb-3">
                  <input
                    value={projectQuery}
                    onChange={(event) => setProjectQuery(event.target.value)}
                    placeholder="Type a project name"
                    className="w-full rounded-md border border-[#eadfd0] bg-[#fdf4ec] px-3 py-2 text-sm text-[#3c2f23] placeholder:text-[#b9a896] focus:border-[#d4522f] focus:outline-none"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleProjectSelect(null)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition hover:bg-[#fdf4ec] ${
                      !selectedProjectId ? "text-[#d4522f]" : "text-[#6d5a4c]"
                    }`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#fdf4ec] text-[#d4522f]">
                      <InboxIcon />
                    </span>
                    <span className="flex-1">Inbox</span>
                    {!selectedProjectId ? <CheckIcon /> : null}
                  </button>
                </div>
                <div className="mt-3 border-t border-[#f0e3d4] pt-3">
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#b39f8a]">
                    My Projects
                  </p>
                  <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                    {isLoadingProjects ? (
                      <p className="px-3 py-2 text-xs text-[#a18f7c]">Loading projects…</p>
                    ) : filteredProjects.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-[#a18f7c]">No matching projects</p>
                    ) : (
                      filteredProjects.map((project) => (
                        <button
                          type="button"
                          key={project.id}
                          onClick={() => handleProjectSelect(project.id)}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition hover:bg-[#fdf4ec] ${
                            selectedProjectId === project.id ? "text-[#d4522f]" : "text-[#6d5a4c]"
                          }`}
                        >
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#fdf4ec] text-[#d4522f]">
                            <ProjectIcon />
                          </span>
                          <span className="flex-1 truncate">{project.name}</span>
                          {selectedProjectId === project.id ? <CheckIcon /> : null}
                        </button>
                      ))
                    )}
                    {projectsError ? (
                      <p className="px-3 py-2 text-xs text-[#d4522f]">{projectsError}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-[#eadfd0] px-4 py-2 text-sm font-medium text-[#7a6757] transition hover:bg-[#f7efe6]"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#e05b37] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c64c2b] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Adding…" : "Add task"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-xs text-[#d4522f]" aria-live="polite">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
