"use server"

import { Priority, Role, Status } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {auth, currentUser} from "@clerk/nextjs/server";
import { cacheDelete } from "@/lib/cache";
import { cacheSet } from "@/lib/cache";
import { cacheGet } from "@/lib/cache"

interface CreateProjectProps {
  name: string;
  summary?: string | null;
  description?: string | null;
  status?: Status;
  priority?: Priority;
  startDate?: Date;
  targetDate?: Date;
  members?: string[] | null;
}   

interface ProjectTableData {
  id: string, 
  name: string, 
  status: Status,
  priority:Priority,
  targetDate: Date,
}

export async function CreateProject(data: CreateProjectProps) {
  
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if( !user ) throw new Error("User not found");

    const project = await prisma.project.create({
        data:{
            name: data.name,
            summary: data.summary,
            description: data.description,
            status: data.status,
            priority: data.priority,
            startDate: data.startDate,
            targetDate: data.targetDate,
            ownerId: user.id,
        },
        include:{   memberships:true    }
    });

    await prisma.membership.create({
        data: {
          role: "ADMIN",
          userId: user.id,
          projectId: project.id,
        },
      });

      await cacheDelete(`users:${user.id}:projects`)
    return project;
    
}

export async function GetProjectLists() {
  const { userId } = await auth();
  const cacheKey = `users:${userId}:projects`

  if(!userId) throw new Error("User not authenticated");

  const redisData = await cacheGet(cacheKey)

  if(redisData) return redisData;

  const projects = await prisma.project.findMany({
    where:{
      OR:[
        { ownerId: userId },
        { memberships: { some: { userId: userId } } }
      ]
      
    },
    select: {
      id: true, 
      name: true, 
      status: true,
      priority:true,
      targetDate: true,
    }
  })

  await cacheSet(`users:${userId}:projects` , projects , 120)

  return projects;
}

export async function GetProjectTimeline() {
  const { userId } = await auth();
  
  if(!userId) throw new Error("User not authenticated");

  const cacheKey = `users:${userId}:projects:timeline`;
  
  const redisData = await cacheGet(cacheKey);
  if(redisData) return redisData;

  const projects = await prisma.project.findMany({
    where:{
      OR:[
        { ownerId: userId },
        { memberships: { some: { userId: userId } } }
      ]
    },
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const monthlyData: Record<string, number> = {};
  let cumulativeCount = 0;

  projects.forEach((project) => {
    cumulativeCount++;
    const date = new Date(project.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = cumulativeCount;
  });

  const timelineData = Object.entries(monthlyData).map(([month, count]) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      projects: count,
    };
  });

  await cacheSet(cacheKey, timelineData, 120);

  return timelineData;
}

export async function GetProjectById(projectId: string) {
  const { userId } = await auth();

  if(!userId) throw new Error("User not authenticated");

  const ProjectCache = await cacheGet(`users:${userId}:projects:${projectId}`)

  if(ProjectCache) return ProjectCache;

  const project = await prisma.project.findFirst({
    where:{
      id: projectId,
      OR: [
        { ownerId: userId },
        { memberships: { some: { userId: userId } } }
      ]
    },
    include:{
      memberships: {
        include: {
          user: true
        }
      },
      tasks: true,
    }
  })

  if (!project) {
    throw new Error("Project not found");
  }

  const currentUserMembership = project.memberships.find(m => m.userId === userId);
  const userRole = project.ownerId === userId ? 'ADMIN' : currentUserMembership?.role || 'VIEWER';

  const response =  {
    ...project,
    currentUserRole: userRole
  };

  await cacheSet(`users:${userId}:projects:${projectId}` , response , 120) 

  return response
}

interface UpdateProjectProps {
  id: string;
  name?: string;
  summary?: string | null;
  description?: string | null;
  status?: Status;
  priority?: Priority;
  startDate?: Date | null;
  targetDate?: Date | null;
}

export async function UpdateProject(data: UpdateProjectProps) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const projectId = data.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      memberships: true,
    },
  });

  if (!project) throw new Error("Project not found");

  const isOwner = project.ownerId === userId;
  const membership = project.memberships.find((m) => m.userId === userId);

  const isAllowed =
    isOwner ||
    (membership && (membership.role === Role.ADMIN || membership.role === Role.EDITOR));

  if (!isAllowed) {
    throw new Error("You do not have permission to update this project");
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      summary: data.summary,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate,
      targetDate: data.targetDate,
    },
    include: {
      memberships: {
        include: { user: true },
      },
    },
  });

  await cacheDelete(`users:${userId}:projects`);               
  await cacheDelete(`users:${userId}:projects:${projectId}`);  

  const currentMembership = updatedProject.memberships.find(
    (m) => m.userId === userId
  );

  const currentUserRole = isOwner
    ? Role.ADMIN
    : currentMembership?.role || Role.VIEWER;

  return {
    ...updatedProject,
    currentUserRole,
  };
}

export async function deleteProject(projectId: string) {
  const user = await currentUser();

  if(!user) throw new Error("User not authenticated");

  const project = await prisma.project.findUnique({
    where: {id: projectId},
  })

  if(!project) throw new Error("Project not found");

  const isOwner = project.ownerId === user.id;

  if(!isOwner) throw new Error("You don't have permission to delete this project");

  await prisma.project.delete({
    where: {id: projectId},
  })

  await cacheDelete(`users:${user.id}:projects`);               
  await cacheDelete(`users:${user.id}:projects:${projectId}`); 

  return { success: true };
}