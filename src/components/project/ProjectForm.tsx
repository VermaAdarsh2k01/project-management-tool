"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Package, MoreHorizontal, Users, Calendar, Plus, ChevronDown, CalendarIcon, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { SignalHigh , SignalMedium, SignalLow } from 'lucide-react'
import { z } from 'zod'
import { useModal } from '../ui/animated-modal'

const PriorityIcons = {
  "no-priority": <MoreHorizontal className="w-4 h-4" />,
  "low": <SignalLow className="w-4 h-4" />,
  "medium": <SignalMedium className="w-4 h-4" />,
  "high": <SignalHigh className="w-4 h-4" />,
  "urgent": <AlertTriangle className="w-4 h-4" />,
}

const SectionColors = {
  "backlog": "bg-red-400",
  "todo": "bg-blue-400", 
  "in-progress": "bg-yellow-400",
  "done": "bg-green-400",
}

const projectSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  summary: z.string().max(200, "Summary must be less than 200 characters").nullable(),
  section: z.enum(["backlog", "todo", "in-progress", "done"]),
  priority: z.enum(["no-priority", "low", "medium", "high", "urgent"]),
  members: z.array(z.string()).nullable(),
  startDate: z.date(),
  targetDate: z.date(),
  description: z.string().max(1000, "Description must be less than 1000 characters").nullable(),
})

type ProjectFormData = z.infer<typeof projectSchema>
const ProjectForm = () => {
  const modal = useModal()
  const [projectName, setProjectName] = useState('')
  const [summary, setSummary] = useState('')
  const [section, setSection] = useState('backlog')
  const [priority, setPriority] = useState('no-priority')
  const [members, setMembers] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}) // Clear previous errors
    
    const currentDate = new Date()
    const formData = {
      projectName,
      summary: summary.trim() || null,
      section,
      priority,
      members: members.length > 0 ? members : null,
      startDate: startDate || currentDate,
      targetDate: targetDate || currentDate,
      description: description.trim() || null,
    }

    try {
      const validatedData = projectSchema.parse(formData)
      console.log('Valid form data:', validatedData)
      // Here you would typically submit the data to your API
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
    setProjectName('')
    setSummary('')
    setSection('backlog')
    setPriority('no-priority')
    setMembers([])
    setStartDate(undefined)
    setTargetDate(undefined)
    setDescription('')
    setErrors({})
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl lg:text-lg font-semibold">New project</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <Input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={`text-2xl font-semibold border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400 bg-[#0A0A0A] placeholder:text-3xl md:text-3xl ${errors.projectName ? 'border-red-500' : ''}`}
            autoFocus
          />
          {errors.projectName && (
            <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <Input
            type="text"
            placeholder="Add a short summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={`border-0 px-0 focus-visible:ring-0 text-sm placeholder:text-gray-400 text-wrap ${errors.summary ? 'border-red-500' : ''}`}
          />
          {errors.summary && (
            <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
          )}
        </div>

        {/* Metadata Row - Section, Priority, Members, Dates */}
        <div className="flex flex-wrap gap-2">
          {/* Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${SectionColors[section as keyof typeof SectionColors]}`}></div>
                <span className="font-medium">{section === 'backlog' ? 'Backlog' : section === 'todo' ? 'To Do' : section === 'in-progress' ? 'In Progress' : 'Done'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSection('backlog'); }}>
                <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                Backlog
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSection('todo'); }}>
                <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSection('in-progress'); }}>
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSection('done'); }}>
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
                {PriorityIcons[priority as keyof typeof PriorityIcons]}
                <span>{priority === 'no-priority' ? 'No priority' : priority === 'low' ? 'Low' : priority === 'medium' ? 'Medium' : priority === 'high' ? 'High' : 'Urgent'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('no-priority'); }}>
                {PriorityIcons['no-priority']}
                No priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('low'); }}>
                {PriorityIcons['low']}
                Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('medium'); }}>
                {PriorityIcons['medium']}
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('high'); }}>
                {PriorityIcons['high']}
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPriority('urgent'); }}>
                {PriorityIcons['urgent']}
                Urgent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Members */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>{members.length > 0 ? `${members.length} member${members.length > 1 ? 's' : ''}` : 'Members'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
          </DropdownMenu>

          {/* Start Date */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{startDate ? format(startDate, 'MMM dd, yyyy') : 'Start Date'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Target Date */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{targetDate ? format(targetDate, 'MMM dd, yyyy') : 'Target Date'}</span>
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
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-neutral-800"></div>

        {/* Description */}
        <div>
          <Textarea
            placeholder="Write a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`min-h-[120px] resize-none border-0 p-2 focus-visible:ring-0 placeholder:text-gray-400 ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>


      </form>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-neutral-800">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
        >
          Create project
        </Button>
      </div>
    </div>
  )
}

export default ProjectForm

