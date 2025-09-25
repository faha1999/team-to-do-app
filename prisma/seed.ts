import {
  PrismaClient,
  ProjectMemberRole,
  ProjectViewType,
  TaskPriority,
  TaskStatus,
  TeamRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const founderEmail = 'founder@teamtodo.test';
  const founderPassword = 'Passw0rd!';
  const ctoEmail = 'cto@teamtodo.test';
  const ctoPassword = 'CtOPassw0rd!';

  const [founderHash, ctoHash] = await Promise.all([
    bcrypt.hash(founderPassword, 12),
    bcrypt.hash(ctoPassword, 12),
  ]);

  const founder = await prisma.user.upsert({
    where: { email: founderEmail },
    update: { passwordHash: founderHash },
    create: {
      email: founderEmail,
      name: 'Amina Rahman',
      passwordHash: founderHash,
      timezone: 'Asia/Dhaka',
    },
  });

  const cto = await prisma.user.upsert({
    where: { email: ctoEmail },
    update: { passwordHash: ctoHash },
    create: {
      email: ctoEmail,
      name: 'Rafiq Ahmed',
      passwordHash: ctoHash,
      timezone: 'Asia/Dhaka',
    },
  });

  const team = await prisma.team.upsert({
    where: { slug: 'core-team' },
    update: {
      name: 'Core Team',
      description: 'Mission control for the leadership group.',
    },
    create: {
      name: 'Core Team',
      slug: 'core-team',
      visibility: 'PRIVATE',
    },
  });

  await prisma.teamMembership.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: founder.id,
      },
    },
    update: { role: TeamRole.OWNER },
    create: {
      teamId: team.id,
      userId: founder.id,
      role: TeamRole.OWNER,
    },
  });

  await prisma.teamMembership.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: cto.id,
      },
    },
    update: { role: TeamRole.ADMIN },
    create: {
      teamId: team.id,
      userId: cto.id,
      role: TeamRole.ADMIN,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 'project_seed_product_launch' },
    update: {
      name: 'Product Launch',
      description:
        'Execute the upcoming launch across product, marketing, and ops.',
      ownerUserId: founder.id,
      teamId: team.id,
    },
    create: {
      id: 'project_seed_product_launch',
      name: 'Product Launch',
      description:
        'Execute the upcoming launch across product, marketing, and ops.',
      ownerUserId: founder.id,
      teamId: team.id,
      viewType: ProjectViewType.LIST,
      status: 'ACTIVE',
    },
  });

  await Promise.all([
    prisma.projectMembership.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: founder.id,
        },
      },
      update: { role: ProjectMemberRole.ADMIN },
      create: {
        projectId: project.id,
        userId: founder.id,
        role: ProjectMemberRole.ADMIN,
      },
    }),
    prisma.projectMembership.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: cto.id,
        },
      },
      update: { role: ProjectMemberRole.ADMIN },
      create: {
        projectId: project.id,
        userId: cto.id,
        role: ProjectMemberRole.ADMIN,
      },
    }),
  ]);

  const backlog = await prisma.section.upsert({
    where: { id: 'section_seed_backlog' },
    update: {
      name: 'Backlog',
      projectId: project.id,
      position: 0,
    },
    create: {
      id: 'section_seed_backlog',
      name: 'Backlog',
      position: 0,
      projectId: project.id,
    },
  });

  await prisma.section.upsert({
    where: { id: 'section_seed_in_progress' },
    update: {
      name: 'In Progress',
      projectId: project.id,
      position: 1,
    },
    create: {
      id: 'section_seed_in_progress',
      name: 'In Progress',
      position: 1,
      projectId: project.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task_seed_messaging_framework' },
    update: {
      title: 'Define messaging framework',
      description: 'Review brand tone and finalise messaging pillars.',
      priority: TaskPriority.P2,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(),
      projectId: project.id,
      sectionId: backlog.id,
      creatorId: founder.id,
      assigneeId: founder.id,
    },
    create: {
      id: 'task_seed_messaging_framework',
      title: 'Define messaging framework',
      description: 'Review brand tone and finalise messaging pillars.',
      priority: TaskPriority.P2,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(),
      order: 0,
      projectId: project.id,
      sectionId: backlog.id,
      creatorId: founder.id,
      assigneeId: founder.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task_seed_landing_wireframes' },
    update: {
      title: 'Draft landing page wireframes',
      description: 'Prepare hero, value props, and CTA flow.',
      priority: TaskPriority.P3,
      status: TaskStatus.OPEN,
      projectId: project.id,
      sectionId: backlog.id,
      creatorId: founder.id,
      assigneeId: founder.id,
      dueDate: null,
    },
    create: {
      id: 'task_seed_landing_wireframes',
      title: 'Draft landing page wireframes',
      description: 'Prepare hero, value props, and CTA flow.',
      priority: TaskPriority.P3,
      status: TaskStatus.OPEN,
      order: 1,
      projectId: project.id,
      sectionId: backlog.id,
      creatorId: founder.id,
      assigneeId: founder.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task_seed_launch_checklist' },
    update: {
      title: 'Prepare launch checklist',
      priority: TaskPriority.P1,
      status: TaskStatus.OPEN,
      projectId: project.id,
      sectionId: backlog.id,
      creatorId: founder.id,
      assigneeId: founder.id,
      dueDate: null,
      order: 2,
    },
    create: {
      id: 'task_seed_launch_checklist',
      title: 'Prepare launch checklist',
      priority: TaskPriority.P1,
      status: TaskStatus.OPEN,
      projectId: project.id,
      sectionId: backlog.id,
      creatorId: founder.id,
      order: 2,
    },
  });

  const tasks = await prisma.task.findMany({ where: { projectId: project.id } });

  for (const task of tasks) {
    await prisma.taskAssignment.upsert({
      where: {
        taskId_userId: {
          taskId: task.id,
          userId: founder.id,
        },
      },
      update: {},
      create: {
        taskId: task.id,
        userId: founder.id,
      },
    });

    await prisma.taskAssignment.upsert({
      where: {
        taskId_userId: {
          taskId: task.id,
          userId: cto.id,
        },
      },
      update: {},
      create: {
        taskId: task.id,
        userId: cto.id,
      },
    });
  }

  console.log('Seed completed. Login with', {
    founder: { email: founderEmail, password: founderPassword },
    cto: { email: ctoEmail, password: ctoPassword },
  });
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
