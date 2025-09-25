export type CalendarTask = {
  id: string;
  title: string;
  dueAt: Date;
};

export function groupTasksByDay(tasks: CalendarTask[]) {
  const map = new Map<string, CalendarTask[]>();
  for (const task of tasks) {
    const day = task.dueAt.toISOString().slice(0, 10);
    const current = map.get(day) ?? [];
    current.push(task);
    map.set(day, current);
  }
  return map;
}
