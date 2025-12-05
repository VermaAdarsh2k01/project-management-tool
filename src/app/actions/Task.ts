"use server"
import { Priority, Status } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

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
    
    const cachekey = `projects:${FormData.projectId}:tasks`;
    await cacheDelete(cachekey);

    return task;
}

export async function getTasksByProjectId(projectId:string) {
    const { userId } = await auth();
    if(!userId) throw new Error("User not authenticated");
    
    const cachekey = `projects:${projectId}:tasks`;
    
    const redisData = await cacheGet(cachekey);
    if(redisData) return redisData;
    
    const tasks = await prisma.task.findMany({
        where:{
            projectId : projectId,
        }
    })
    
    if (tasks) {
        await cacheSet(cachekey, tasks, 200);
    }

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
        data: data,
    })
    
    const cachekey = `projects:${existingTask.projectId}:tasks`;
    await cacheDelete(cachekey);

    return updatedTask;
}