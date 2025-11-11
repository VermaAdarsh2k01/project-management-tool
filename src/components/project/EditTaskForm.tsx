"use client"

import React, { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { CheckSquare, MoreHorizontal, ChevronDown, CalendarIcon, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { SignalHigh, SignalMedium, SignalLow } from 'lucide-react'
import { z } from 'zod'
import { useModal } from '../ui/animated-modal'
import { Task, useTaskStore } from '@/store/TaskStore'
import { updateTask } from '@/app/actions/Task'
import { toast } from 'sonner'
import { Status, Priority } from '@prisma/client'

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

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").nullable(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.date().nullable(),
})

const EditTaskForm = ({task}: {task: Task}) => {

    const { title: taskTitle, description: taskDescription, status: taskStatus, priority: taskPriority, dueDate: taskDueDate } = task;
    const modal = useModal()
    const [title, setTitle] = useState(taskTitle)
    const [description, setDescription] = useState(taskDescription || null)
    const [status, setStatus] = useState<Status>(taskStatus)
    const [priority, setPriority] = useState<Priority>(taskPriority)
    const [dueDate, setDueDate] = useState<Date | undefined>(taskDueDate || undefined)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isPending, startTransition] = useTransition()
    const { updateTask : updateTaskInStore } = useTaskStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({}) 
    
    const formData = {
      title: title.trim(),
      description: description?.trim() ?? null,
      status,
      priority,
      dueDate: dueDate || null,
    }

    try {
      const validated = taskSchema.parse(formData)

      const originalTaskData = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate,
      }
      
      // Random Temp Task for Zustand
      updateTaskInStore(task.id, {
        title: validated.title,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        dueDate: validated.dueDate,
      })

      startTransition(async () => {
        try {
          const newTask = await updateTask(task.id, {
            title: validated.title,
            description: validated.description,
            status: validated.status,
            priority: validated.priority,
            dueDate: validated.dueDate,
          })
          
          updateTaskInStore(task.id, { ...newTask })
          modal.setOpen(false)
          toast.success("Task updated successfully")
        } catch (err) {
          updateTaskInStore(task.id, { ...originalTaskData })
          toast.error("Failed to update task")
        }
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const handleCancel = () => {
    modal.setOpen(false)
    setTitle('')
    setDescription('')
    setStatus('BACKLOG')
    setPriority('NO_PRIORITY')
    setDueDate(undefined)
    setErrors({})
  }

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'NO_PRIORITY': return 'No priority'
      case 'LOW': return 'Low'
      case 'MEDIUM': return 'Medium'
      case 'HIGH': return 'High'
      case 'URGENT': return 'Urgent'
      default: return 'No priority'
    }
  }

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'BACKLOG': return 'Backlog'
      case 'TODO': return 'To Do'
      case 'IN_PROGRESS': return 'In Progress'
      case 'DONE': return 'Done'
      default: return 'Backlog'
    }
  }

  return (
    <div className="w-full flex flex-col justify-evenly h-full ">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <CheckSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl lg:text-lg font-semibold">Edit task</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <Input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`text-2xl font-semibold border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400 bg-[#0A0A0A] placeholder:text-3xl md:text-3xl ${errors.title ? 'border-red-500' : ''}`}
            autoFocus
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <input
            type="text"
            placeholder="Add a description, acceptance criteria, or notes..."
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full border-0 px-0 focus-visible:ring-0 focus:outline-none placeholder:text-gray-400 bg-transparent ${errors.description ? 'border-red-500' : ''} text-wrap`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Metadata Row - Status, Priority, Due Date */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${StatusColors[status]}`}></div>
                <span className="font-medium">{getStatusLabel(status)}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus('BACKLOG'); }}>
                <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                Backlog
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus('TODO'); }}>
                <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus('IN_PROGRESS'); }}>
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus('DONE'); }}>
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {PriorityIcons[priority]}
                <span>{getPriorityLabel(priority)}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('NO_PRIORITY'); }}>
                {PriorityIcons['NO_PRIORITY']}
                No priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('LOW'); }}>
                {PriorityIcons['LOW']}
                Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('MEDIUM'); }}>
                {PriorityIcons['MEDIUM']}
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('HIGH'); }}>
                {PriorityIcons['HIGH']}
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('URGENT'); }}>
                {PriorityIcons['URGENT']}
                Urgent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Due Date */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Due Date'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
      </form>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? 'Updating...' : 'Update task'}
        </Button>
      </div>
    </div>
  )
}

export default EditTaskForm