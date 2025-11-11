import { Priority, Status } from "@prisma/client";
import { create } from "zustand";

export type Task = {
    id: string;
    title:string;
    description?: string | null;
    status:Status;
    priority:Priority;
    dueDate?: Date | null;
    createdAt: Date;
    projectId: string;
}

type TaskStore = {
    tasks:Task[];
    addTask: (t: Task) => void;
    removeTask: (id: string) => void;
    updateTask: (id:string , updates: Partial<Task>) => void;
    setTasks: ( tasks: Task[] ) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
        tasks: [],
        addTask: (t: Task) => set((state) => ({ tasks: [...state.tasks , t]})),
        removeTask: (id: string) => set((state) => ({tasks: state.tasks.filter((t) => t.id !== id)})),
        updateTask: (id:string , updates: Partial<Task>) => set((state) => ({
            tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
        })),
        setTasks: ( tasks: Task[] ) => set({ tasks }),
    }) 
)