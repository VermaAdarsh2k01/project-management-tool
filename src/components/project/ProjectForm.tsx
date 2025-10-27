"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, MoreHorizontal, Users, Calendar, Plus } from 'lucide-react'



const ProjectForm = () => {
  const [projectName, setProjectName] = useState('')
  const [summary, setSummary] = useState('')
  const [section, setSection] = useState('backlog')
  const [priority, setPriority] = useState('no-priority')
  const [members, setMembers] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      projectName,
      summary,
      section,
      priority,
      members,
      startDate,
      targetDate,
      description,
    })
  }

  const handleCancel = () => {
    // Reset form or close modal
    console.log('Cancel clicked')
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">New project</h2>
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
            className="text-2xl font-semibold border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>

        {/* Summary */}
        <div>
          <Input
            type="text"
            placeholder="Add a short summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="border-0 px-0 focus-visible:ring-0 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>

        {/* Metadata Row - Section, Priority, Lead */}
        <div className="flex flex-wrap gap-2">
          {/* Section */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="font-medium">Backlog</span>
          </button>

          {/* Priority */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>No priority</span>
          </button>

          {/* Members */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Members</span>
          </button>

          {/* Start Date */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Start</span>
          </button>

          {/* Target Date */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Target</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-neutral-800"></div>

        {/* Description */}
        <div>
          <Textarea
            placeholder="Write a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none border-0 p-2 focus-visible:ring-0 placeholder:text-gray-600 dark:placeholder:text-gray-600"
          />
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

