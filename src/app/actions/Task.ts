"use server"
import { Priority, Status } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

interface FormData {
    title: string;
    description?: string | null;
    status: Status;
    priority: Priority;
    dueDate?: Date | null;
    projectId: string;
}

export async function createTask(FormData: FormData){
    const{ userId } = await auth();
    if(!userId) throw new Error("User not authenticated");
    
    const user = await currentUser();
    if(!user) throw new Error("User not authenticated");

    const task = await prisma.task.create({
        data:{
            title:FormData.title,
            description:FormData.description || null,
            status:FormData.status ?? "BACKLOG",
            priority:FormData.priority ?? "NO_PRIORITY",
            dueDate:FormData.dueDate || null,
            projectId:FormData.projectId,
        },
    })

    return task;
}

export async function getTasksByProjectId(projectId:string) {
    const tasks = await prisma.task.findMany({
        where:{
            projectId : projectId,
        }
    })

    return tasks
}

export async function updateTask(taskId:string, data: Partial<FormData>) {
    const{ userId } = await auth();
    if(!userId) throw new Error("User not authenticated");

    const existingTask = await prisma.task.findUnique({
        where:{ id: taskId },
    })

    if(!existingTask) throw new Error("Task not found");

    const updatedTask = await prisma.task.update({
        where:{ id: taskId },
        data: { ...existingTask, ...data },
    })

    return updatedTask;
}