"use client";

import { useEffect, useState, useTransition } from "react";
import { Priority, Status } from "@prisma/client";
import {
  AlertTriangle,
  CalendarIcon,
  Check,
  ChevronDown,
  Edit2,
  MoreHorizontal,
  Package,
  SignalHigh,
  SignalLow,
  SignalMedium,
  X,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { useProjectStore } from "@/store/ProjectStore";
import { UpdateOverviewData } from "@/app/actions/Overview";

const PriorityIcons = {
  NO_PRIORITY: <MoreHorizontal className="w-4 h-4" />,
  LOW: <SignalLow className="w-4 h-4" />,
  MEDIUM: <SignalMedium className="w-4 h-4" />,
  HIGH: <SignalHigh className="w-4 h-4" />,
  URGENT: <AlertTriangle className="w-4 h-4" />,
};

const StatusColors= {
  BACKLOG: "bg-red-400",
  TODO: "bg-blue-400",
  IN_PROGRESS: "bg-yellow-400",
  DONE: "bg-green-400",
};

const StatusLabels = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const PriorityLabels = {
  NO_PRIORITY: "No priority",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

interface InitialDataProp {
  projectId: string;
  name: string;
  summary: string | null;
  description: string | null;
  status: Status;
  priority: Priority;
  startDate: Date | null;
  targetDate: Date | null;
}

type OverviewUpdateInput = {
  name: string;
  summary: string | null;
  description: string | null;
  status: Status;
  priority: Priority;
  startDate: Date | null;
  targetDate: Date | null;
};

export default function OverviewClient({
  canEdit,
  initialData,
}: {
  canEdit: boolean;
  initialData: InitialDataProp;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { updateProject } = useProjectStore();

  const { projectId } = initialData;

  // Local editable state
  const [name, setName] = useState(initialData.name);
  const [summary, setSummary] = useState(initialData.summary ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [status, setStatus] = useState<Status>(initialData.status);
  const [priority, setPriority] = useState<Priority>(initialData.priority);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData.startDate ? new Date(initialData.startDate) : undefined
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    initialData.targetDate ? new Date(initialData.targetDate) : undefined
  );

  // Synchronize state with initialData when it changes
  useEffect(() => {
    setName(initialData.name);
    setSummary(initialData.summary ?? "");
    setDescription(initialData.description ?? "");
    setStatus(initialData.status);
    setPriority(initialData.priority);
    setStartDate( initialData.startDate ? new Date(initialData.startDate) : undefined );
    setTargetDate( initialData.targetDate ? new Date(initialData.targetDate) : undefined );
  }, [initialData]);

  const editMode = canEdit && isEditing;

  const handleEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(initialData.name);
    setSummary(initialData.summary ?? "");
    setDescription(initialData.description ?? "");
    setStatus(initialData.status);
    setPriority(initialData.priority);
    setStartDate(
      initialData.startDate ? new Date(initialData.startDate) : undefined
    );
    setTargetDate(
      initialData.targetDate ? new Date(initialData.targetDate) : undefined
    );
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!canEdit) return;

    const original = { ...initialData };

    const optimistic: OverviewUpdateInput = {
      name,
      summary: summary.trim() || null,
      description: description.trim() || null,
      status,
      priority,
      startDate: startDate ?? null,
      targetDate: targetDate ?? null,
    };

    // Optimistic update into store (if you want the list / other views to react)
    updateProject(projectId, optimistic);

    setIsEditing(false);

    startTransition(async () => {
      try {
        const updated = await UpdateOverviewData({
          projectId,
          data: optimistic,
        });

        // Sync store with real server response
        updateProject(projectId, updated);
      } catch (err) {
        console.error("Failed to update:", err);

        // Roll back store
        updateProject(projectId, {
          name: original.name,
          summary: original.summary,
          description: original.description,
          status: original.status,
          priority: original.priority,
          startDate: original.startDate,
          targetDate: original.targetDate,
        });

        // Roll back local state
        setName(original.name);
        setSummary(original.summary ?? "");
        setDescription(original.description ?? "");
        setStatus(original.status);
        setPriority(original.priority);
        setStartDate(
          original.startDate ? new Date(original.startDate) : undefined
        );
        setTargetDate(
          original.targetDate ? new Date(original.targetDate) : undefined
        );

        setIsEditing(true);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-transparent rounded-lg p-6 w-[50%] h-full flex items-center">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              {!editMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editMode}
              className="text-2xl md:text-3xl font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent h-auto min-h-0 disabled:opacity-100 disabled:cursor-default"
              placeholder="Project name"
            />
          </div>

          {/* Summary */}
          <div>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!editMode}
              className="text-sm border-0 px-0 focus-visible:ring-0 bg-transparent h-auto min-h-0 disabled:opacity-100 disabled:cursor-default text-gray-600 dark:text-gray-400 disabled:text-gray-600 dark:disabled:text-gray-400"
              placeholder={
                summary ? "Add a short summary..." : "No summary provided"
              }
            />
          </div>

          {/* Metadata Row - Status, Priority, Dates */}
          <div className="flex flex-wrap gap-2">
            {/* Status */}
            {editMode ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colours"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${StatusColors[status]}`}
                    ></div>
                    <span className="font-medium">{StatusLabels[status]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setStatus("BACKLOG")}>
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                    Backlog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("TODO")}>
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                    To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("IN_PROGRESS")}>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("DONE")}>
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${StatusColors[status]}`}
                ></div>
                <span className="font-medium">{StatusLabels[status]}</span>
              </div>
            )}

            {/* Priority */}
            {editMode ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colours"
                  >
                    {PriorityIcons[priority]}
                    <span>{PriorityLabels[priority]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setPriority("NO_PRIORITY")}>
                    {PriorityIcons["NO_PRIORITY"]}
                    No priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriority("LOW")}>
                    {PriorityIcons["LOW"]}
                    Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriority("MEDIUM")}>
                    {PriorityIcons["MEDIUM"]}
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriority("HIGH")}>
                    {PriorityIcons["HIGH"]}
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriority("URGENT")}>
                    {PriorityIcons["URGENT"]}
                    Urgent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                {PriorityIcons[priority]}
                <span>{PriorityLabels[priority]}</span>
              </div>
            )}

            {/* Start Date */}
            {editMode ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colours"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {startDate
                        ? format(startDate, "MMM dd, yyyy")
                        : "Start date"}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {startDate
                    ? format(startDate, "MMM dd, yyyy")
                    : "No start date"}
                </span>
              </div>
            )}

            {/* Target Date */}
            {editMode ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colours"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {targetDate
                        ? format(targetDate, "MMM dd, yyyy")
                        : "Target date"}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {targetDate
                    ? format(targetDate, "MMM dd, yyyy")
                    : "Target Date"}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-neutral-800" />

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-3">Description</h3>
            {editMode ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none border border-gray-200 dark:border-neutral-700 p-3 focus-visible:ring-0"
                placeholder="Write a description, a project brief, or collect ideas..."
              />
            ) : description ? (
              <div className="min-h-[120px] p-3 border border-gray-200 dark:border-neutral-700 rounded-md bg-gray-50 dark:bg-neutral-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            ) : (
              <div className="min-h-[120px] p-3 border border-gray-200 dark:border-neutral-700 rounded-md bg-gray-50 dark:bg-neutral-800 flex items-center justify-center">
                <p className="text-sm text-gray-400 italic">
                  No description provided
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
