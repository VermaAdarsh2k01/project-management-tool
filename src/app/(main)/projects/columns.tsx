"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Priority, Status } from "@prisma/client";
import { MoreHorizontal, SignalHigh, SignalMedium, SignalLow, AlertTriangle , Box, Trash, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteProject } from "@/app/actions/Project";
import { useProjectStore } from "@/store/ProjectStore";
import { toast } from "sonner";


export type ProjectData = {
    id:string,
    name:string,
    status:Status,
    targetDate:Date | null,
    priority:Priority,
}

const PriorityIcons = {
  "NO_PRIORITY": <MoreHorizontal className="w-4 h-4" />,
  "LOW": <SignalLow className="w-4 h-4" />,
  "MEDIUM": <SignalMedium className="w-4 h-4" />,
  "HIGH": <SignalHigh className="w-4 h-4" />,
  "URGENT": <AlertTriangle className="w-4 h-4" />,
}

const StatusColors = {
  "BACKLOG": "bg-red-400",
  "TODO": "bg-blue-400", 
  "IN_PROGRESS": "bg-yellow-400",
  "DONE": "bg-green-400",
}

const StatusLabels = {
  "BACKLOG": "Backlog",
  "TODO": "To Do",
  "IN_PROGRESS": "In Progress",
  "DONE": "Done",
}

const PriorityLabels = {
  "NO_PRIORITY": "No priority",
  "LOW": "Low",
  "MEDIUM": "Medium",
  "HIGH": "High",
  "URGENT": "Urgent",
}




const formatData = (date: Date | null) => {
    if (!date) return null;
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

const ProjectActionsCell = ({ project }: { project: ProjectData }) => {
    // ✅ Move hook to component level
    const { removeProject: removeProjectFromStore } = useProjectStore();
    
    const handleDeleteProject = async (projectId: string) => {
        removeProjectFromStore(projectId);
        await deleteProject(projectId);
        toast.success("Project deleted successfully");
    }
    
    return (
    <div onClick={(e) => e.stopPropagation()}>
        <AlertDialog>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>Delete Project</DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    <span className="font-semibold"> &quot;{project.name}&quot;</span> and remove all associated data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                onClick={() => handleDeleteProject(project.id)}
                >Delete</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
    );
}

export const columns: ColumnDef<ProjectData>[] = [
    {
        header: "Name",
        accessorKey: "name",
        size: 300,
        cell: ({row}) => {
            const name = row.getValue("name") as string;
            return (
                <div className="font-medium flex items-center gap-2">
                    <Box className="w-4 h-4 text-muted-foreground" />
                    {name}
                </div>
            );
        }
    },
    {
        header: "Status",
        accessorKey: "status",
        size: 150,
        cell: ({row}) => {
            const status = row.getValue("status") as Status;
            return (
                <div className="inline-flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${StatusColors[status]}`}></div>
                    <span>{StatusLabels[status]}</span>
                </div>
            );
        }
    },
    {
        header: "Target Date",
        accessorKey: "targetDate",
        size: 150,
        cell: ({row}) => {
            const date = row.getValue("targetDate") as Date | null;
            return <div>{formatData(date)}</div>;
        }
    },
    {
        header: "Priority",
        accessorKey: "priority",
        size: 150,
        cell: ({row}) => {
            const priority = row.getValue("priority") as Priority;
            return (
                <div className="inline-flex items-center gap-2">
                    {PriorityIcons[priority]}
                    <span>{PriorityLabels[priority]}</span>
                </div>
            );
        }
    },
    {
        header: "Actions",
        accessorKey: "actions",
        size: 100,
        cell: ({row}) => {
            const project = row.original as ProjectData;
            return( 
            <div onClick={(e) => e.stopPropagation()}>
                <ProjectActionsCell project={project} />
            </div>
            )
        },
    },
];