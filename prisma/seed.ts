import { PrismaClient, ProjectViewType, TaskPriority, TaskStatus, TeamRole, ProjectMemberRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "founder@teamtodo.test";
  const password = "Passw0rd!";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Amina Rahman",
      passwordHash,
      timezone: "Asia/Dhaka",
    },
  });

  const team = await prisma.team.upsert({
    where: { slug: "core-team" },
    update: {},
    create: {
      name: "Core Team",
      slug: "core-team",
      visibility: "PRIVATE",
      members: {
        create: [{ userId: user.id, role: TeamRole.OWNER }],
      },
      projects: {
        create: [
          {
            name: "Product Launch",
            description: "End-to-end program for the upcoming launch.",
            ownerUserId: user.id,
            viewType: ProjectViewType.LIST,
            members: {
              create: [{ userId: user.id, role: ProjectMemberRole.ADMIN }],
            },
            sections: {
              create: [
                {
                  name: "Backlog",
                  position: 0,
                },
                {
                  name: "In Progress",
                  position: 1,
                },
              ],
            },
            tasks: {
              create: [
                {
                  title: "Define messaging framework",
                  description: "Review brand tone and finalize messaging pillars.",
                  creatorId: user.id,
                  priority: TaskPriority.P2,
                  status: TaskStatus.IN_PROGRESS,
                  order: 0,
                  dueDate: new Date(),
                },
                {
                  title: "Draft landing page wireframes",
                  description: "Prepare hero, key value props, and CTA flow.",
                  creatorId: user.id,
                  priority: TaskPriority.P3,
                  status: TaskStatus.OPEN,
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      projects: true,
    },
  });

  const [project] = team.projects;

  if (project) {
    const backlog = await prisma.section.findFirst({
      where: { projectId: project.id, name: "Backlog" },
    });

    if (backlog) {
      await prisma.task.create({
        data: {
          title: "Prepare launch checklist",
          creatorId: user.id,
          projectId: project.id,
          sectionId: backlog.id,
          priority: TaskPriority.P1,
          status: TaskStatus.OPEN,
          order: 2,
        },
      });
    }
  }

  console.log("Seed completed. Login with", { email, password });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
