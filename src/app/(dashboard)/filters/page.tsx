// src/app/(dashboard)/filters/page.tsx
import FiltersClient from './FiltersClient';

// --- Mock fetchers (replace with real DB calls or Server Actions) ---
type SavedFilter = {
  id: string;
  name: string;
  shared: boolean;
  owner: { id: string; name: string };
  queryJSON: Record<string, unknown>;
  updatedAt: string; // ISO
};

async function fetchSavedFilters(): Promise<SavedFilter[]> {
  // TODO: replace with prisma.savedFilter.findMany(...)
  return [
    {
      id: 'flt_today_p1',
      name: 'Today · P1 only',
      shared: true,
      owner: { id: 'u1', name: 'You' },
      queryJSON: {
        due: { op: 'on', date: new Date().toISOString().slice(0, 10) },
        priority: ['P1'],
        status: ['OPEN', 'IN_PROGRESS'],
      },
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'flt_waiting',
      name: '@waiting (all projects)',
      shared: false,
      owner: { id: 'u1', name: 'You' },
      queryJSON: { labels: ['@waiting'], status: ['OPEN', 'IN_PROGRESS'] },
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'flt_my_assigned_week',
      name: 'Assigned to me · this week',
      shared: true,
      owner: { id: 'u2', name: 'Team Admin' },
      queryJSON: {
        assigneeId: 'me',
        due: {
          op: 'onOrBefore',
          date: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
        },
        status: ['OPEN', 'IN_PROGRESS'],
      },
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];
}

export default async function FiltersPage() {
  const filters = await fetchSavedFilters();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Subtle background accent */}
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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Saved Filters
            </h1>
            <p className="text-sm text-zinc-500">
              Create focused views like “Today P1” or “@waiting in Work”. Share
              with your team when needed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/(dashboard)/filters/new"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              + New filter
            </a>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          <FiltersClient initialFilters={filters} />
        </div>
      </section>
    </main>
  );
}
