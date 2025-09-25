// src/app/(dashboard)/calendar/month/page.tsx
'use client';

import { useMemo, useState } from 'react';

type Task = {
  id: string;
  title: string;
  date: Date; // single-day marker for month grid
  project?: string;
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
};

function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function getMonthGrid(d: Date, weekStartsOn = 1) {
  const first = startOfMonth(d);
  const last = endOfMonth(d);
  const firstDay = (first.getDay() + 7 - weekStartsOn) % 7; // shift to Mon-start
  const totalDays = firstDay + last.getDate();
  const weeks = Math.ceil(totalDays / 7);
  const start = addDays(first, -firstDay);
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
}

export default function MonthCalendarPage() {
  const [cursor, setCursor] = useState<Date>(startOfMonth(new Date()));

  // Demo tasks (replace with your DB data)
  const tasks: Task[] = useMemo(() => {
    const base = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    return [
      {
        id: 'm1',
        title: 'Sprint planning',
        date: addDays(base, 2),
        project: 'Core',
        priority: 'P1',
      },
      {
        id: 'm2',
        title: 'Design QA',
        date: addDays(base, 6),
        project: 'UI',
        priority: 'P2',
      },
      {
        id: 'm3',
        title: 'Client demo',
        date: addDays(base, 14),
        project: 'CX',
        priority: 'P1',
      },
      {
        id: 'm4',
        title: 'Team retro',
        date: addDays(base, 21),
        project: 'Ops',
        priority: 'P3',
      },
      {
        id: 'm5',
        title: 'Release',
        date: addDays(base, 27),
        project: 'Core',
        priority: 'P1',
      },
    ];
  }, [cursor]);

  const days = useMemo(() => getMonthGrid(cursor), [cursor]);
  const monthName = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const today = new Date();
  const weekdays = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(2023, 0, i + 2).toLocaleDateString(undefined, {
        weekday: 'short',
      }), // Mon start
  );

  const prevMonth = () =>
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setCursor(startOfMonth(new Date()));

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Background accent */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-x-0 top-[-10rem] mx-auto h-[24rem] w-[36rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(24,24,27,0.10), rgba(24,24,27,0))',
          }}
        />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Topbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Calendar — Month
            </h1>
            <p className="text-sm text-zinc-500">{monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Today
            </button>
            <div className="inline-flex overflow-hidden rounded-lg border border-zinc-200">
              <button
                onClick={prevMonth}
                className="h-9 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                aria-label="Previous month">
                ‹
              </button>
              <button
                onClick={nextMonth}
                className="h-9 border-l border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                aria-label="Next month">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Calendar card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/60">
            {weekdays.map((w) => (
              <div
                key={w}
                className="flex h-12 items-center justify-center text-sm font-medium text-zinc-700">
                {w}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const inMonth = isSameMonth(d, cursor);
              const isToday = sameDay(d, today);
              const dayTasks = tasks.filter((t) => sameDay(t.date, d));
              return (
                <div
                  key={d.toISOString()}
                  className={`min-h-[120px] border-b border-r border-zinc-100 p-2 ${
                    (i + 1) % 7 === 0 ? 'border-r-0' : ''
                  } ${inMonth ? 'bg-white' : 'bg-zinc-50/60'}`}>
                  {/* Day label */}
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        isToday
                          ? 'bg-zinc-950 font-semibold text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                      title={d.toDateString()}>
                      {d.getDate()}
                    </span>

                    {/* Count bubble */}
                    {dayTasks.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-900" />
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task list (show up to 3) */}
                  <ul className="space-y-1.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <li
                        key={t.id}
                        className="truncate rounded-md border border-zinc-200 bg-white px-2 py-1 text-[12px] text-zinc-800 shadow-sm"
                        title={t.title}>
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-zinc-900 align-middle" />
                        {t.title}
                      </li>
                    ))}
                    {dayTasks.length > 3 && (
                      <li className="text-[12px] text-zinc-500">
                        +{dayTasks.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
