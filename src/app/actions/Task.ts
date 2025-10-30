"use server"
import { Priority, Status } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

interface FormData {
    title: string;
    description?: string | null;
    status: Status;
    priority: Priority;
    dueDate?: Date | null;
    projectId: string;
}

export async function createTask(FormData: FormData){

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