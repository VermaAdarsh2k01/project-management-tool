"use client"

import React, { useEffect, useState, useTransition } from 'react'
import { Package, MoreHorizontal, Users, CalendarIcon, AlertTriangle, Edit2, Check, X, ChevronDown } from 'lucide-react'
import { SignalHigh, SignalMedium, SignalLow } from 'lucide-react'
import { format } from 'date-fns'
import { UpdateProject } from '@/app/actions/Project'
import { Priority, Status } from '@/generated/prisma/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { useProjectStore } from '@/store/ProjectStore'

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

interface ProjectData {
  id: string
  name: string
  summary: string | null
  description: string | null
  status: Status
  priority: Priority
  startDate: Date | null
  targetDate: Date | null
  currentUserRole: string
  memberships: Array<{
    user: {
      id: string
      name: string | null
      email: string
    }
  }>
}

interface OverviewSectionProps {
  project: ProjectData;
}

const OverviewSection = ({ project: initialProject }: OverviewSectionProps) => {
  const [project, setProject] = useState<ProjectData>(initialProject)
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  

  const { updateProject } = useProjectStore()
  

  const canEdit = project?.currentUserRole === 'ADMIN' || project?.currentUserRole === 'EDITOR'
  
  // Edit form state
  const [editName, setEditName] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editStatus, setEditStatus] = useState<Status>('BACKLOG')
  const [editPriority, setEditPriority] = useState<Priority>('NO_PRIORITY')
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined)
  const [editTargetDate, setEditTargetDate] = useState<Date | undefined>(undefined)
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    // Initialize edit state with project data
    setEditName(initialProject.name)
    setEditSummary(initialProject.summary || '')
    setEditStatus(initialProject.status)
    setEditPriority(initialProject.priority)
    setEditStartDate(initialProject.startDate ? new Date(initialProject.startDate) : undefined)
    setEditTargetDate(initialProject.targetDate ? new Date(initialProject.targetDate) : undefined)
    setEditDescription(initialProject.description || '')
  }, [initialProject])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (!project) return
    // Reset edit state to current project data
    setEditName(project.name)
    setEditSummary(project.summary || '')
    setEditStatus(project.status)
    setEditPriority(project.priority)
    setEditStartDate(project.startDate ? new Date(project.startDate) : undefined)
    setEditTargetDate(project.targetDate ? new Date(project.targetDate) : undefined)
    setEditDescription(project.description || '')
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!project) return

    // Store original project data for rollback
    const originalProject = { ...project }
    
    // Optimistic update - immediately update the UI
    const optimisticUpdates = {
      name: editName,
      summary: editSummary.trim() || null,
      status: editStatus,
      priority: editPriority,
      startDate: editStartDate || null,
      targetDate: editTargetDate || null,
      description: editDescription.trim() || null,
    }
    
    // Update local state immediately
    setProject({ ...project, ...optimisticUpdates })
    
    // Update Zustand store immediately (optimistic)
    updateProject(project.id, optimisticUpdates)
    
    setIsEditing(false)

    startTransition(async () => {
      try {
        const updatedProject = await UpdateProject({
          id: project.id,
          ...optimisticUpdates,
        })
        
        // Update with real data from server
        setProject(updatedProject)
        updateProject(project.id, {
          name: updatedProject.name,
          summary: updatedProject.summary,
          status: updatedProject.status,
          priority: updatedProject.priority,
          startDate: updatedProject.startDate,
          targetDate: updatedProject.targetDate,
          description: updatedProject.description,
        })
        
        toast.success('Project updated successfully')
      } catch (error) {
        console.error('Error updating project:', error)
        
        // Rollback optimistic updates on error
        setProject(originalProject)
        updateProject(project.id, {
          name: originalProject.name,
          summary: originalProject.summary,
          status: originalProject.status,
          priority: originalProject.priority,
          startDate: originalProject.startDate,
          targetDate: originalProject.targetDate,
          description: originalProject.description,
        })
        
        // Reset edit state to original values
        setEditName(originalProject.name)
        setEditSummary(originalProject.summary || '')
        setEditStatus(originalProject.status)
        setEditPriority(originalProject.priority)
        setEditStartDate(originalProject.startDate ? new Date(originalProject.startDate) : undefined)
        setEditTargetDate(originalProject.targetDate ? new Date(originalProject.targetDate) : undefined)
        setEditDescription(originalProject.description || '')
        setIsEditing(true) // Re-enter edit mode
        
        toast.error('Failed to update project')
      }
    })
  }

  if (!project) {
    return (
      <div className='bg-white dark:bg-neutral-900 rounded-lg p-4 xl:max-w-5xl h-full flex items-center justify-center'>
        <div>Project not found</div>
      </div>
    )
  }

  return (
    <div className='bg-white dark:bg-transparent rounded-lg p-6 max-w-5xl h-full flex items-center'>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
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
                    {isPending ? 'Saving...' : 'Save'}
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
              value={isEditing && canEdit ? editName : project.name}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!isEditing || !canEdit}
              className="text-2xl md:text-3xl font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent h-auto min-h-0 disabled:opacity-100 disabled:cursor-default"
              placeholder="Project name"
            />
          </div>

          {/* Summary */}
          <div>
            <Input
              value={isEditing && canEdit ? editSummary : (project.summary || '')}
              onChange={(e) => setEditSummary(e.target.value)}
              disabled={!isEditing || !canEdit}
              className="text-sm border-0 px-0 focus-visible:ring-0 bg-transparent h-auto min-h-0 disabled:opacity-100 disabled:cursor-default text-gray-600 dark:text-gray-400 disabled:text-gray-600 dark:disabled:text-gray-400"
              placeholder={!project.summary ? "No summary provided" : "Add a short summary..."}
            />
          </div>

          {/* Metadata Row - Status, Priority, Members, Dates */}
          <div className="flex flex-wrap gap-2">
            {/* Status */}
            {isEditing && canEdit ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${StatusColors[editStatus]}`}></div>
                    <span className="font-medium">{StatusLabels[editStatus]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setEditStatus('BACKLOG')}>
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                    Backlog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditStatus('TODO')}>
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                    To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditStatus('IN_PROGRESS')}>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditStatus('DONE')}>
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <div className={`w-2 h-2 rounded-full ${StatusColors[project.status]}`}></div>
                <span className="font-medium">{StatusLabels[project.status]}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            )}

            {/* Priority */}
            {isEditing && canEdit ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {PriorityIcons[editPriority]}
                    <span>{PriorityLabels[editPriority]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setEditPriority('NO_PRIORITY')}>
                    {PriorityIcons['NO_PRIORITY']}
                    No priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditPriority('LOW')}>
                    {PriorityIcons['LOW']}
                    Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditPriority('MEDIUM')}>
                    {PriorityIcons['MEDIUM']}
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditPriority('HIGH')}>
                    {PriorityIcons['HIGH']}
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditPriority('URGENT')}>
                    {PriorityIcons['URGENT']}
                    Urgent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                {PriorityIcons[project.priority]}
                <span>{PriorityLabels[project.priority]}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            )}

            {/* Members */}
            {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <Users className="w-4 h-4" />
              <span>
                {project.memberships.length > 0 
                  ? `${project.memberships.length} member${project.memberships.length > 1 ? 's' : ''}`
                  : 'No members'
                }
              </span>
            </div> */}

            {/* Start Date */}
            {isEditing && canEdit ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>{editStartDate ? format(editStartDate, 'MMM dd, yyyy') : 'Start Date'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={editStartDate}
                    onSelect={setEditStartDate}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {project.startDate 
                    ? format(new Date(project.startDate), 'MMM dd, yyyy')
                    : 'No start date'
                  }
                </span>
                <ChevronDown className="w-3 h-3" />
              </div>
            )}

            {/* Target Date */}
            {isEditing && canEdit ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>{editTargetDate ? format(editTargetDate, 'MMM dd, yyyy') : 'Target Date'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={editTargetDate}
                    onSelect={setEditTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {project.targetDate 
                    ? format(new Date(project.targetDate), 'MMM dd, yyyy')
                    : 'No target date'
                  }
                </span>
                <ChevronDown className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-neutral-800"></div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-3">Description</h3>
            {isEditing && canEdit ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[120px] resize-none border border-gray-200 dark:border-neutral-700 p-3 focus-visible:ring-0"
                placeholder="Write a description, a project brief, or collect ideas..."
              />
            ) : (
              <>
                {project.description ? (
                  <div className="min-h-[120px] p-3 border border-gray-200 dark:border-neutral-700 rounded-md bg-gray-50 dark:bg-neutral-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>
                ) : (
                  <div className="min-h-[120px] p-3 border border-gray-200 dark:border-neutral-700 rounded-md bg-gray-50 dark:bg-neutral-800 flex items-center justify-center">
                    <p className="text-sm text-gray-400 italic">No description provided</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Members List */}
          {/* {project.memberships.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Team Members</h3>
              <div className="space-y-2">
                {project.memberships.map((membership) => (
                  <div key={membership.user.id} className="flex items-center gap-3 p-2 border border-gray-200 dark:border-neutral-700 rounded-md">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {membership.user.name 
                          ? membership.user.name.charAt(0).toUpperCase()
                          : membership.user.email.charAt(0).toUpperCase()
                        }
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {membership.user.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {membership.user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default OverviewSection
