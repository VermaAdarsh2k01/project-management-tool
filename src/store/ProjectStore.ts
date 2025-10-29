import { Priority, Status } from '@/generated/prisma/client';
import {create} from 'zustand';

export type Project = {
    id: string;
    name: string;
    summary?: string | null;
    description?: string | null;
    status: Status;
    priority: Priority;
    startDate: Date | null;
    targetDate: Date | null;
    members?: string[] | null;
}

type ProjectStore = {
    projects: Project[];
    addProject: (p: Project) => void;
    removeProject: (id: string) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    projects: [],
    addProject: (p: Project) => set((state) => ({ projects: [...state.projects, p] })),
    removeProject: (id: string) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
    updateProject: (id: string, updates: Partial<Project>) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
    })),
    setProjects: (projects: Project[]) => set({ projects }),
}));