import { FolderKanban } from "lucide-react";
import { GetProjectLists } from "@/app/actions/Project";

export function ProjectCountCardSkeleton() {
    return (
        <div className="mt-6 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg w-fit">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
                <div>
                    <div className="h-9 w-16 bg-neutral-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

export async function ProjectCountCard() {
    const projects = await GetProjectLists();
    const projectCount = projects.length;
    
    return (
        <div className="mt-6 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg w-fit">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <p className="text-3xl font-bold">{projectCount}</p>
                    <p className="text-gray-400 text-sm">
                        {projectCount === 1 ? 'Project' : 'Projects'} you&apos;re part of
                    </p>
                </div>
            </div>
        </div>
    );
}
