# Team To‑Do App — Full Spec & Architecture (Next.js + Tailwind)

This document distills feature list into a concrete, market‑standard plan you can hand to an AI agent or developer. It covers: data model (fields), UX flows, architecture, API endpoints, security, file/folder structure, and build/deploy guidance without paid services.

---

# 1) Core entities & fields (data model)

Use Prisma with SQLite to start (single-file DB, no paid infra), and you can later swap SQLite → Postgres with zero code changes beyond the connection string.

## Users & Auth

- **User**

  - `id (cuid)`, `name`, `email (unique)`, `passwordHash` (using credentials), `avatarUrl?`
  - `timezone`, `locale`, `createdAt`, `updatedAt`, `status (ACTIVE/SUSPENDED)`

- **Role** (for global admin)

  - `role (ADMIN | MEMBER)`

- **Session** (NextAuth tables for using credentials provider)
- **AuditLog**

  - `id`, `actorId`, `action` (CREATE_TASK/UPDATE_TASK/DELETE_TASK/COMPLETE_TASK/...)
  - `entityType` (TASK/PROJECT/TEAM/USER/COMMENT), `entityId`, `prev`, `next`, `createdAt`

## Teams & Memberships

- **Team**

  - `id`, `name`, `slug`, `description?`, `visibility (PUBLIC | PRIVATE)`, `createdAt`

- **TeamMembership**

  - `id`, `teamId`, `userId`, `teamRole (OWNER | ADMIN | MEMBER | GUEST)`, `createdAt`

- **TeamSettings**

  - `teamId`, `invitePolicy`, `defaultProjectVisibility`, `dataRetentionDays?`

## Projects & Structure

- **Project**

  - `id`, `teamId?` (nullable for personal), `ownerUserId` (for personal),
  - `name`, `description?`, `visibility (PUBLIC | PRIVATE)`,
  - `viewType (LIST | BOARD)`, `status (ACTIVE | ARCHIVED)`,
  - `priority?`, `folderId?`, `createdAt`, `updatedAt`

- **ProjectRole**

  - `id`, `projectId`, `userId` (or `teamRole` inheritance),
  - `role (ADMIN | EDITOR | COMMENTER | VIEWER)`

- **ProjectFolder**

  - `id`, `teamId?`, `name`, `parentFolderId?`

- **Section**

  - `id`, `projectId`, `name`, `order`

- **Label**

  - `id`, `teamId?`, `name`, `color?`, `isSystem?`

## Tasks (with subtasks)

- **Task**

  - `id`, `projectId`, `sectionId?`,
  - `title`, `description? (rich text)`,
  - `assigneeId?`, `creatorId`,
  - `dueDate?`, `dueTime?`, `recurrenceRule? (RRULE text)`,
  - `startDate?`, `estimateMinutes?`,
  - `priority (P1|P2|P3|P4)`, `status (OPEN|IN_PROGRESS|DONE|CANCELLED)`,
  - `isToday?` (derived), `isUpcoming?` (derived),
  - `parentTaskId?` (for subtask),
  - `order`, `createdAt`, `updatedAt`, `completedAt?`

- **TaskLabel** (many-to-many)

  - `taskId`, `labelId`

- **Reminder**

  - `id`, `taskId`, `remindAt (DateTime)`, `channel (WEB|PUSH|EMAIL)`, `sentAt?`

- **Comment**

  - `id`, `taskId`, `authorId`, `body (rich)`, `createdAt`, `editedAt?`

- **SavedFilter** (custom views)

  - `id`, `ownerUserId`, `teamId?`, `name`, `queryJSON` (see filtering DSL below), `shared (bool)`

## Calendar & Views

- **CalendarViewPreference**

  - `userId`, `defaultView (DAILY|WEEKLY|MONTHLY)`, `workWeekStart`, `workingHours { start,end }`

## Admin / Governance

- **Invite**

  - `id`, `email`, `teamId?`, `role?`, `token`, `expiresAt`, `acceptedAt?`

- **OrgPolicy**

  - `id`, `teamId`, `allowPublicProjects`, `exportEnabled`, `whoCanCreateTeams`, etc.

## Core Principles & Non‑Functional Requirements

- **Local-first UX, cloud-backed**: fast, optimistic UI with offline support (PWA + IndexedDB). Sync to server when online.
- **Role-based access control (RBAC)**: `ADMIN`, `LEADER`, `MEMBER`, `VIEWER` (read-only). Project-level permissions override team defaults.
- **Privacy clarity**: team vs personal spaces, explicit data ownership.
- **Performance**: server-side rendering (SSR) for data-heavy pages; RSC with streaming where possible; cache user + project lists.
- **Accessibility (WCAG 2.2 AA)**: focus states, semantic HTML, keyboard shortcuts, screen-reader labels.
- **Internationalization-ready**: i18n keys for all UI strings.
- **Auditability**: every mutate action logged to an immutable `ActivityLog` table.
- **Zero paid APIs**: use free-tier auth/storage/db and in-app/browser push.

## 2) Data Model (Entities & Fields)

Below is a production-grade schema you can translate to Prisma/SQL. Types assume SQL-ish semantics.

### 2.1 Account & Org

**User**

- `id` (uuid)
- `name` (text)
- `email` (text, unique)
- `password_hash` (text) — for Credentials auth (Argon2id)
- `avatar_url` (text, nullable)
- `timezone` (text, IANA)
- `locale` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Team**

- `id` (uuid)
- `name` (text)
- `slug` (text, unique)
- `description` (text)
- `visibility` (enum: `private`, `internal`, `public`) — public=discoverable
- `created_by` (uuid → User)
- `created_at`, `updated_at`

**TeamMembership** (User ↔ Team)

- `id` (uuid)
- `team_id` (uuid)
- `user_id` (uuid)
- `role` (enum: `ADMIN`, `LEADER`, `MEMBER`, `VIEWER`)
- `status` (enum: `active`, `invited`, `suspended`)
- `created_at`, `updated_at`

**Invitation**

- `id` (uuid)
- `team_id` (uuid)
- `email` (text)
- `role` (enum)
- `token` (text, unique)
- `expires_at` (timestamptz)
- `created_at`

**UserSettings**

- `id` (uuid)
- `user_id` (uuid)
- `daily_start_hour` (int 0–23)
- `daily_end_hour` (int 0–23)
- `week_start` (enum: `monday`, `sunday`)
- `default_view` (enum: `today`, `upcoming`, `calendar`, `inbox`)
- `focus_mode_enabled` (bool)
- `notifications_enabled` (bool)
- `created_at`, `updated_at`

### 2.2 Projects & Organization

**Project**

- `id` (uuid)
- `team_id` (uuid, nullable for personal)
- `owner_id` (uuid → User)
- `title` (text)
- `description` (text)
- `visibility` (enum: `private`, `team`, `public`)
- `view_type` (enum: `list`, `board`)
- `status` (enum: `active`, `archived`)
- `due_date` (date, nullable)
- `created_at`, `updated_at`

**ProjectFolder**

- `id` (uuid)
- `team_id` (uuid)
- `title` (text)
- `parent_id` (uuid, nullable) — nested folders
- `created_at`, `updated_at`

**ProjectFolderItem** (Folder ↔ Project)

- `id` (uuid)
- `folder_id` (uuid)
- `project_id` (uuid)

**ProjectMember** (User ↔ Project with roles)

- `id` (uuid)
- `project_id` (uuid)
- `user_id` (uuid)
- `role` (enum: `ADMIN`, `EDITOR`, `COMMENTER`, `VIEWER`)

### 2.3 Tasks & Planning

**Section**

- `id` (uuid)
- `project_id` (uuid)
- `title` (text)
- `position` (float for stable ordering)

**Task**

- `id` (uuid)
- `project_id` (uuid, nullable for personal “Inbox”)
- `section_id` (uuid, nullable)
- `parent_id` (uuid, nullable) — for subtasks
- `title` (text)
- `description` (rich text/json)
- `assignee_id` (uuid, nullable)
- `priority` (enum: `P1`, `P2`, `P3`, `P4`)
- `label_ids` (uuid[] denormalized index, optional)
- `due_at` (timestamptz, nullable)
- `start_at` (timestamptz, nullable)
- `duration_min` (int, nullable)
- `recurrence_rrule` (text, nullable) — RFC 5545 string
- `reminder_minutes_before` (int[], nullable)
- `status` (enum: `open`, `in_progress`, `blocked`, `done`, `cancelled`)
- `position` (float)
- `estimated_minutes` (int, nullable)
- `actual_minutes` (int, nullable)
- `created_by` (uuid)
- `created_at`, `updated_at`, `completed_at` (nullable)

**TaskLabel**

- `id` (uuid)
- `team_id` (uuid, nullable for personal)
- `name` (text)
- `color` (text)
- `created_by` (uuid)

**TaskLabelJoin** (Task ↔ Label)

- `id` (uuid)
- `task_id` (uuid)
- `label_id` (uuid)

**Comment**

- `id` (uuid)
- `task_id` (uuid)
- `author_id` (uuid)
- `body` (rich text/json)
- `created_at`

**SavedFilter**

- `id` (uuid)
- `user_id` (uuid)
- `name` (text)
- `query` (text) — DSL, e.g. `assignee:me AND due:today AND priority:P1`
- `is_default` (bool)

**ActivityLog**

- `id` (uuid)
- `actor_id` (uuid)
- `entity_type` (enum: `task`, `project`, `comment`, `membership`, `label`...)
- `entity_id` (uuid)
- `action` (text: `create`, `update`, `delete`, `complete`, `reopen`...)
- `diff` (jsonb)
- `occurred_at` (timestamptz)

**Notification**

- `id` (uuid)
- `user_id` (uuid)
- `type` (enum: `mention`, `assign`, `due`, `comment`, `status_change`)
- `payload` (jsonb)
- `read_at` (timestamptz, nullable)
- `created_at`

---

# 2) Features → how to implement (no paid server/API)

## Authentication & RBAC

- **NextAuth (credentials provider)** with bcrypt password hashing stored locally.
- Protect routes with **middleware** (check role/team membership).
- Row-level security in code: verify access before every read/update.
- Admin pages gated by `role === 'ADMIN'` or `teamRole in [OWNER, ADMIN]`.

## Data storage

- **Prisma + SQLite** (file DB) for local/office deployment.

  - Deploy a single Node process with `pm2` on an office machine or LAN mini-PC.

- File uploads: store under `/uploads` (later swap to S3-compatible when needed).

## Real-time UX (optional, no paid infra)

- Use **WebSockets via socket.io** in the same Node server for live task updates, comments, and activity log.
- Or start simple: **polling**/SWR revalidation every 5–10s for task lists.

## Reminders & recurring tasks

- Parse and store **RRULE** strings (e.g., `FREQ=DAILY;BYHOUR=9`).
- A **node-cron** worker in the same process:

  - Nightly job expands upcoming recurring instances for N days ahead.
  - Minutely job sends due reminders (web notifications + in-app).

- **PWA**: add service worker for **Web Push** via VAPID (no paid API).

## Calendar views

- Weekly & monthly: server computes a user’s visible tasks by date range.
- **ICS export** endpoint per user/team (read-only calendar feed).
- **Today / Upcoming** are just saved queries:

  - Today: `dueDate === today OR overdue`, sorted by priority/time.
  - Upcoming: `dueDate > today` (next 7/14 days), grouped by day.

## Filters (Saved Views)

- Keep a small JSON DSL, e.g.:

```json
{
  "projects": ["proj_123", "proj_456"],
  "labels": ["@waiting", "@design"],
  "priority": ["P1", "P2"],
  "due": { "op": "onOrBefore", "date": "2025-10-01" },
  "assigneeId": "me",
  "status": ["OPEN", "IN_PROGRESS"]
}
```

- Convert this JSON to Prisma where clauses.

## Permissions model (clear & scalable)

- **Team level**: OWNER/ADMIN/MEMBER/GUEST.
- **Project level**: ADMIN/EDITOR/COMMENTER/VIEWER (overrides team default).
- Personal projects: only owner (can share read-only links if you want).
- Admin area: central page to view members, roles, data export, retention, and activity log.

## Activity & audit

- Log: who created/edited/completed/deleted tasks, role changes, project visibility changes. Provide a **Team Activity** feed (filterable by entity/user/date).

## Performance & DX

- **Next.js App Router**, **Server Actions** for mutations (no client API needed).
- Use **Zod** schemas for input validation.
- Caching: **SWR** on client lists; `revalidatePath` post-mutations.
- Pagination & virtualized lists for large projects.

## Security & compliance basics

- Hash passwords (bcrypt), set strong cookie flags, CSRF is handled by NextAuth.
- File type/mime checks for uploads.
- Rate limiting on auth routes.
- Export/Deletion endpoints to comply with basic data portability.
- Passwords: **Argon2id** with per-user salt.
- Sessions: HttpOnly secure cookies; short access + long refresh; rotate on privilege change.
- CSRF: SameSite=Lax + anti‑CSRF token for POST.
- Rate limiting: sliding window (IP + user) for auth & mutations.
- Authorization: route middleware checks; server-side checks on every action.
- Validation: Zod schemas for all inputs; constrain SQL with Prisma client.
- Content security policy (CSP) & upload scanning (size/type allowlist).
- Audit: `ActivityLog` append-only.

---

# 3) UX that matches “international standard”

- **Capture at the speed of thought**:

  - Global **“Quick Add”** (⌘/Ctrl+K) opens a command palette: “Add Task…”, natural language parser for date (“tomorrow 9am”, “every Mon”), `@labels`, `#project`, `+assignee`.

- **Stay organized & focused**:

  - Left nav: Inbox, Today, Upcoming, Filters, Labels, Projects, Team.
  - **Focus mode** (hides sidebar & completed), keyboard shortcuts for everything.

- **Flexible project views**:

  - Toggle **List / Board** per project; drag & drop sections/columns/tasks.

- **Holistic daily views**:

  - **Today** merges personal + joined team tasks (with subtle badges).
  - **Upcoming** shows the next weeks with group headers per day.

- **Breakdown of your day**:

  - A “My Schedule” rail: timeline of today with due times & estimates.
  - One-click **“Plan my day”** (auto-slot tasks into free blocks).

- **Team workspace**:

  - Discoverable **public team projects** with preview & one-click join.
  - Shareable deep links to project/section/task/comment.

- **Admin controls**:

  - Centralized Team Settings: roles, visibility defaults, member management, exports, audit.

  ### Capture at speed of thought

- **Global quick add** (`⌘/Ctrl + K`): modal with: `title`, `project`, `labels`, `priority`, `due`, `assignee`, `description`. Optimistic insert.
- **Natural language due parsing**: "tomorrow 5pm", "every Mon 9am" → server normalizes to `due_at` + `recurrence_rrule`.

### Organize & focus

- **Views**: `Today`, `Upcoming`, `Calendar (week/month)`, `Board`, `List`.
- **Filters**: saved & ad-hoc. Query DSL maps to SQL. Examples:
- `assignee:me AND due:today`
- `project:Work AND priority:P1`
- `label:@waiting AND status:open AND due<=2025-09-30`
  Parser translates to SQL/Prisma where clauses.

- **Focus mode**: hides non‑today items, disables badges, shows timebox schedule.

### Planning & calendar

- **Weekly/Monthly**: drag tasks to days/time; generates/updates `start_at/due_at` and optional `duration_min`.
- **Recurring**: RRULE editor (daily/weekly/monthly/custom). Instances generated on read; next instance created on completion.
- **Reminders**: in-app + web push (VAPID). Optional email via free SMTP.

### Team tasks & permissions

- **Team workspace** with public/private projects.
- **Browse & join** public projects; link-based preview for tasks/sections/projects.
- **Activity log** per project; global team log for admins.

### Admin controls

- **Team settings**: roles, member provisioning, project role overrides, data export (JSON/CSV/ICS), retention rules.
- **Project roles**: override team role to grant finer access.

**Global**

- App shell with sidebar (Inbox, Today, Upcoming, Calendar, Team Workspaces), top bar (search, quick add, user menu).
- Command palette (quick actions & navigation).

**Screens**

- **Today**: tasks grouped by timebox, overdue banner, quick-add.
- **Upcoming**: calendar strip + tasks per day, drag to reschedule.
- **Calendar**: week & month views; drag/resize to set `start_at`, `due_at`, `duration_min`.
- **Project (List)**: sections as collapsible groups; inline subtask creation; bulk edit.
- **Project (Board)**: columns = sections; drag cards; WIP limits (optional).
- **Task drawer**: right-side panel with details, comments, activity.
- **Team admin**: members list, invitations, roles, project access matrix, activity log.

**Design system**

- Tokens: font sizes, spacing, radii, shadows; dark mode; color-safe priority badges.
- Components: Button, Input, Select, Combobox, Dialog, Drawer, Tabs, Tooltip, Toast, Avatar, Badge, Breadcrumbs, Date/Time picker, RRULE editor, Kanban card, Calendar grid.

**Keyboard shortcuts**

- Quick add: `q`/`c`
- Complete: `x`
- Schedule today/tomorrow: `t`/`y`
- Move priority: `1..4`
- Open command palette: `⌘/Ctrl + K`

---

# 4) File & folder structure (Next.js App Router)

```
to-doist-clone/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── icons/ ...
│   └── manifest.json            # PWA
├── uploads/                     # local file storage (gitignored)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Today view
│   │   │   ├── upcoming/page.tsx
│   │   │   ├── inbox/page.tsx
│   │   │   ├── filters/
│   │   │   │   ├── page.tsx            # list saved filters
│   │   │   │   └── [id]/page.tsx       # run filter
│   │   │   ├── labels/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── calendar/
│   │   │   │   ├── week/page.tsx
│   │   │   │   └── month/page.tsx
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx            # list teams / switch
│   │   │   │   └── [teamId]/
│   │   │   │       ├── page.tsx        # team overview
│   │   │   │       ├── settings/page.tsx
│   │   │   │       ├── activity/page.tsx
│   │   │   │       └── projects/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx            # all projects
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx        # list view
│   │   │   │       ├── board/page.tsx  # board view
│   │   │   │       └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── ics/[userId]/route.ts    # calendar feed
│   │   │   └── webpush/subscribe/route.ts
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/                          # buttons, inputs, modal, dropdown, etc.
│   │   ├── task/
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskEditor.tsx
│   │   │   └── QuickAdd.tsx
│   │   ├── project/
│   │   │   ├── Section.tsx
│   │   │   └── BoardColumn.tsx
│   │   ├── calendar/
│   │   │   ├── WeekView.tsx
│   │   │   └── MonthView.tsx
│   │   ├── filters/FilterBuilder.tsx
│   │   ├── nav/Sidebar.tsx
│   │   └── layout/Topbar.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── rrule.ts
│   │   ├── filters.ts
│   │   ├── permissions.ts
│   │   ├── activity.ts
│   │   ├── calendar.ts
│   │   └── notifications.ts
│   ├── server/
│   │   ├── actions/                     # Server Actions
│   │   │   ├── tasks.ts
│   │   │   ├── projects.ts
│   │   │   ├── teams.ts
│   │   │   ├── labels.ts
│   │   │   ├── filters.ts
│   │   │   └── quotes.ts                # OPTIONAL
│   │   ├── sockets/                     # if using socket.io
│   │   │   └── index.ts
│   │   └── jobs/
│   │       ├── cron.ts
│   │       └── reminder-processor.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── index.ts
├── .env.example
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
└── README.md
```

---

# 5) What to consider while developing (checklist)

**Architecture**

- Start with **MVP**: Users, Teams, Projects, Tasks, Today/Upcoming, Comments, Labels, Reminders, Roles, Admin.
- Add **Board view**, **Folders**, **Saved Filters**, **Calendar** in iterations.

**Scalability & migration**

- Choose Prisma relations carefully (n-n for labels, roles).
- Add composite indexes: `(projectId, status, dueDate)`, `(assigneeId, status, dueDate)`.

**Usability**

- Keyboard shortcuts everywhere, optimistic UI, drag-and-drop.
- Inline editors (task title, due date, assignee) without page reloads.

**Internationalization**

- i18n strings; date/time per `timezone` & `locale`.

**Backups**

- Nightly SQLite copy to `/backups/` with timestamp; downloadable by admin.

**Offline/PWA**

- Cache app shell; queue mutations when offline (optional, later).

**Testing**

- Unit tests for filter builder & RRULE expansion.
- E2E critical flows (auth, create task, complete task).

---

# 6) “Speed of thought” capture (implementation notes)

- Global command palette (`⌘/Ctrl+K`) with free-text parser:

  - Examples:

    - `Fix landing copy #Website @writing +Fahad tomorrow 9am !!p1`

  - Parse tokens:

    - `#project` → project, `@label` → labels,
    - `+name` → assignee,
    - natural language date/time → dueDate,
    - `!!p1` → priority.

---

# 7) Minimal Prisma schema (slice)

> Not full code—just a feel. Expand as you build.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         Role     @default(MEMBER)
  timezone     String   @default("America/Los_Angeles")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  memberships  TeamMembership[]
  tasks        Task[]   @relation("AssignedTasks")
}

enum Role { ADMIN MEMBER }

model Team {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  visibility  TeamVisibility   @default(PRIVATE)
  createdAt   DateTime         @default(now())
  memberships TeamMembership[]
  projects    Project[]
  labels      Label[]
}

enum TeamVisibility { PUBLIC PRIVATE }

model TeamMembership {
  id       String     @id @default(cuid())
  team     Team       @relation(fields: [teamId], references: [id])
  teamId   String
  user     User       @relation(fields: [userId], references: [id])
  userId   String
  teamRole TeamRole   @default(MEMBER)
  createdAt DateTime  @default(now())
}

enum TeamRole { OWNER ADMIN MEMBER GUEST }

model Project {
  id          String         @id @default(cuid())
  teamId      String?
  team        Team?          @relation(fields: [teamId], references: [id])
  ownerUserId String?
  name        String
  description String?
  viewType    ViewType       @default(LIST)
  visibility  ProjectVis     @default(PRIVATE)
  status      ProjectStatus  @default(ACTIVE)
  sections    Section[]
  tasks       Task[]
  roles       ProjectRole[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum ViewType { LIST BOARD }
enum ProjectVis { PUBLIC PRIVATE }
enum ProjectStatus { ACTIVE ARCHIVED }

model Section {
  id        String   @id @default(cuid())
  project   Project  @relation(fields: [projectId], references: [id])
  projectId String
  name      String
  order     Int
  tasks     Task[]
}

model Task {
  id            String    @id @default(cuid())
  project       Project   @relation(fields: [projectId], references: [id])
  projectId     String
  section       Section?  @relation(fields: [sectionId], references: [id])
  sectionId     String?
  title         String
  description   String?
  assignee      User?     @relation("AssignedTasks", fields: [assigneeId], references: [id])
  assigneeId    String?
  creatorId     String
  dueDate       DateTime?
  dueTime       String?
  recurrenceRule String?
  priority      Priority  @default(P3)
  status        TaskStatus @default(OPEN)
  parentTaskId  String?
  order         Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  completedAt   DateTime?
  labels        TaskLabel[]
  reminders     Reminder[]
  comments      Comment[]
}

enum Priority { P1 P2 P3 P4 }
enum TaskStatus { OPEN IN_PROGRESS DONE CANCELLED }

model Label {
  id      String  @id @default(cuid())
  teamId  String?
  team    Team?   @relation(fields: [teamId], references: [id])
  name    String
  color   String?
  tasks   TaskLabel[]
}

model TaskLabel {
  taskId  String
  labelId String
  task    Task   @relation(fields: [taskId], references: [id])
  label   Label  @relation(fields: [labelId], references: [id])
  @@id([taskId, labelId])
}

model Reminder {
  id       String   @id @default(cuid())
  task     Task     @relation(fields: [taskId], references: [id])
  taskId   String
  remindAt DateTime
  channel  ReminderChannel @default(WEB)
  sentAt   DateTime?
}

enum ReminderChannel { WEB PUSH EMAIL }

model Comment {
  id        String   @id @default(cuid())
  task      Task     @relation(fields: [taskId], references: [id])
  taskId    String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  body      String
  createdAt DateTime @default(now())
  editedAt  DateTime?
}
```

---

# 8) Development roadmap (phased)

**Phase 1 (MVP)**

- Auth (register/login), Profile.
- Teams, Team membership.
- Personal & team **Projects**, **Sections**, **Tasks** (+subtasks).
- Labels, Priorities, Due dates, Today/Upcoming.
- Comments.
- Admin: manage members & roles.
- Basic reminders (in-app), node-cron.

**Phase 2**

- Board view, Project folders, Saved Filters.
- Weekly/Monthly calendar, ICS feeds.
- Activity log, Keyboard shortcuts, Quick Add command palette.
- PWA + Push notifications.
- Project roles & visibility (public/private).
- Team discovery & join via link.

**Phase 3**

- Real-time (socket.io), Offline queue, Data export, Backups UI.

---

# 9) API Design (REST-ish over Next.js Route Handlers)

> All endpoints require auth; all writes validate RBAC and ownership.

**Auth**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

**Teams**

- `GET /api/teams` (my teams)
- `POST /api/teams` (create)
- `GET /api/teams/:id`
- `PATCH /api/teams/:id`
- `DELETE /api/teams/:id`
- `POST /api/teams/:id/invitations`
- `POST /api/teams/:id/members` (add existing)
- `PATCH /api/teams/:id/members/:userId` (role/status)

**Projects**

- `GET /api/projects?teamId=...|personal=1`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`

**Sections**

- `POST /api/projects/:id/sections`
- `PATCH /api/sections/:id`
- `DELETE /api/sections/:id`

**Tasks**

- `GET /api/tasks?view=today|upcoming|filter=...`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/complete`
- `POST /api/tasks/:id/reopen`

**Comments**

- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`

**Labels & Filters**

- `GET /api/labels`
- `POST /api/labels`
- `GET /api/filters`
- `POST /api/filters`

**Activity & Notifications**

- `GET /api/projects/:id/activity`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`

**Exports**

- `GET /api/export/ics?projectId=...` — calendar feed
- `GET /api/export/csv?teamId=...`

---

# 10) Development Checklist (International-standard)

1. **Project setup**: Next.js (TS), Tailwind, ESlint, Prettier, Husky + lint-staged.
2. **DB**: Prisma + SQLite for dev; migrate; seed with demo team/projects/tasks.
3. **Auth**: Credentials provider with Argon2; session cookies; password reset.
4. **RBAC**: middleware + server guards; unit tests for permission matrix.
5. **CRUD**: projects/sections/tasks/comments/labels.
6. **Views**: Today, Upcoming, Calendar (week/month), Project List/Board.
7. **Recurrence & reminders**: RRULE editor; web push; in-app toasts.
8. **Activity log**: append on every mutation; UI feed.
9. **Search & filters**: DSL parser; saved filters; keyboard palette.
10. **PWA**: manifest, service worker, offline queue for quick add.
11. **Accessibility**: axe audits; keyboard flows; reduced motion.
12. **i18n**: next-intl or lingui; English + Bangla base.
13. **Analytics (self-hosted optional)**: Umami/Plausible free-tier.
14. **CI**: GitHub Actions (lint/test/build/prisma validate). Preview deploys.

---

# 11) Deployment (no paid services)

- **Frontend+API**: Vercel free tier or Netlify.
- **Database**: Neon/Supabase free Postgres or Railway free (if available). Start with SQLite if fully self-hosted.
- **Object storage**: Cloudflare R2 (free tier) or local disk (self-hosted).
- **Web Push**: self-generated VAPID keys.

Env sample (`.env`):

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your.app
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
```

---

# 12) Migration & Data Ownership

- Export endpoints for **JSON/CSV/ICS** (per user, project, team).
- Soft-delete with `deleted_at`, periodic purge job for admins.
- Personal projects remain user-owned; team projects remain team-owned. On user removal: reassign or orphan to team.

---

# 13) Extra suggestions

- **Seed script** with demo users/teams/projects so you can demo instantly.
- **Theming**: light/dark with Tailwind class toggles; accessible color contrast.
- **Accessibility**: focus states, ARIA for drag-and-drop, screen-reader labels.
- **Keyboard-first**: `?` shows shortcuts; `A` add task; `D` due date; `L` labels.
- **No paid services**: all features run on a single Node server + SQLite file; add reverse proxy (Nginx) + daily backup cron for safety.
