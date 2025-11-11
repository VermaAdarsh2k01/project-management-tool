"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Priority, Status } from "@prisma/client";
import { MoreHorizontal, SignalHigh, SignalMedium, SignalLow, AlertTriangle , Box } from 'lucide-react';


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
]