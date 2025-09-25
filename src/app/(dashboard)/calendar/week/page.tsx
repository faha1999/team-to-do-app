// src/app/(dashboard)/calendar/week/page.tsx
'use client';

import { useMemo, useState } from 'react';

type Task = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  project?: string;
  assignee?: string;
};

const HOUR_START = 7; // 07:00
const HOUR_END = 20; // 20:00

function startOfWeek(d: Date, weekStartsOn = 1) {
  // 0=Sun..6=Sat; default: Monday
  const date = new Date(d);
  const day = (date.getDay() + 7 - weekStartsOn) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function setTime(d: Date, h: number, m: number) {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function minutesSinceDayStart(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

export default function WeekCalendarPage() {
  const [cursor, setCursor] = useState<Date>(startOfWeek(new Date()));

  // Demo tasks (replace with DB data)
  const tasks: Task[] = useMemo(
    () => [
      {
        id: 't1',
        title: 'Standup',
        start: setTime(addDays(cursor, 0), 9, 30),
        end: setTime(addDays(cursor, 0), 10, 0),
        project: 'Core',
      },
      {
        id: 't2',
        title: 'Design review',
        start: setTime(addDays(cursor, 1), 13, 0),
        end: setTime(addDays(cursor, 1), 14, 30),
        project: 'UI',
      },
      {
        id: 't3',
        title: 'Client sync',
        start: setTime(addDays(cursor, 3), 11, 0),
        end: setTime(addDays(cursor, 3), 12, 0),
        project: 'CX',
      },
      {
        id: 't4',
        title: 'Focus block',
        start: setTime(addDays(cursor, 4), 15, 0),
        end: setTime(addDays(cursor, 4), 17, 0),
      },
    ],
    [cursor],
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(cursor, i)),
    [cursor],
  );
  const hours = useMemo(
    () =>
      Array.from(
        { length: HOUR_END - HOUR_START + 1 },
        (_, i) => HOUR_START + i,
      ),
    [],
  );

  const prevWeek = () => setCursor((d) => addDays(d, -7));
  const nextWeek = () => setCursor((d) => addDays(d, 7));
  const goToday = () => setCursor(startOfWeek(new Date()));

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
              Calendar — Week
            </h1>
            <p className="text-sm text-zinc-500">
              {days[0].toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
              })}{' '}
              –{' '}
              {days[6].toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Today
            </button>
            <div className="inline-flex overflow-hidden rounded-lg border border-zinc-200">
              <button
                onClick={prevWeek}
                className="h-9 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                aria-label="Previous week">
                ‹
              </button>
              <button
                onClick={nextWeek}
                className="h-9 border-l border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                aria-label="Next week">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Day headers */}
          <div className="grid grid-cols-[5rem_repeat(7,1fr)] border-b border-zinc-200 bg-zinc-50/60">
            <div className="h-12" />
            {days.map((d) => {
              const isToday = sameDay(d, new Date());
              return (
                <div
                  key={d.toISOString()}
                  className="flex h-12 items-center justify-center">
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      isToday ? 'font-semibold text-zinc-950' : 'text-zinc-700'
                    }`}>
                    <span>
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-zinc-950 text-white'
                          : 'bg-zinc-200 text-zinc-800'
                      }`}>
                      {d.getDate()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          <div className="grid grid-cols-[5rem_repeat(7,1fr)]">
            {/* Times gutter */}
            <div className="relative">
              {hours.map((h) => (
                <div key={h} className="relative h-16 border-b border-zinc-100">
                  <div className="absolute right-2 top-1 text-[11px] tabular-nums text-zinc-400">{`${h
                    .toString()
                    .padStart(2, '0')}:00`}</div>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => (
              <div key={day.toISOString()} className="relative">
                {/* hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-16 border-l border-zinc-100 border-b"
                  />
                ))}

                {/* tasks */}
                <div className="pointer-events-none absolute inset-0 p-1">
                  {tasks
                    .filter((t) => sameDay(t.start, day))
                    .map((t) => {
                      const totalMinutes = (HOUR_END - HOUR_START) * 60;
                      const topMin = clamp(
                        minutesSinceDayStart(t.start) - HOUR_START * 60,
                        0,
                        totalMinutes - 1,
                      );
                      const endMin = clamp(
                        minutesSinceDayStart(t.end) - HOUR_START * 60,
                        0,
                        totalMinutes,
                      );
                      const heightMin = Math.max(endMin - topMin, 30);
                      const topPct = (topMin / totalMinutes) * 100;
                      const heightPct = (heightMin / totalMinutes) * 100;

                      return (
                        <div
                          key={t.id}
                          className="pointer-events-auto absolute left-1 right-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
                          style={{ top: `${topPct}%`, height: `${heightPct}%` }}
                          title={`${t.title} — ${t.start.toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}–${t.end.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`}>
                          <div className="h-1.5 w-full bg-zinc-900/90" />
                          <div className="p-2">
                            <p className="truncate text-xs font-medium text-zinc-900">
                              {t.title}
                            </p>
                            <p className="truncate text-[11px] text-zinc-500">
                              {t.start.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              –{' '}
                              {t.end.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {t.project && (
                              <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                                #{t.project}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
