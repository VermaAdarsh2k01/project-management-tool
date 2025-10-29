"use server"

import { Priority, Status } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server";

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

    return project;
    
}

export async function GetProjects() {
  const { userId } = await auth();

  if(!userId) throw new Error("User not authenticated");

  const projects = await prisma.project.findMany({
    where:{
      ownerId: userId,
    },
    include:{
      memberships: true,
    }
  })

  return projects;
}

export async function GetProjectById(projectId: string) {
  const { userId } = await auth();

  if(!userId) throw new Error("User not authenticated");

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
    }
  })

  if (!project) {
    throw new Error("Project not found");
  }

  // Find current user's role
  const currentUserMembership = project.memberships.find(m => m.userId === userId);
  const userRole = project.ownerId === userId ? 'ADMIN' : currentUserMembership?.role || 'VIEWER';

  return {
    ...project,
    currentUserRole: userRole
  };
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

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Verify the user has permission to edit this project
  const existingProject = await prisma.project.findFirst({
    where: {
      id: data.id,
      OR: [
        { ownerId: userId },
        { memberships: { some: { userId: userId, role: { in: ['ADMIN', 'EDITOR'] } } } }
      ]
    },
    include: {
      memberships: true
    }
  });

  if (!existingProject) {
    throw new Error("Project not found or insufficient permissions");
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: data.id,
    },
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
        include: {
          user: true
        }
      },
    }
  });

  // Find current user's role
  const currentUserMembership = updatedProject.memberships.find(m => m.userId === userId);
  const userRole = updatedProject.ownerId === userId ? 'ADMIN' : currentUserMembership?.role || 'VIEWER';

  return {
    ...updatedProject,
    currentUserRole: userRole
  };
}