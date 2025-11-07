"use client"

import React from 'react'
import { Task } from '@/store/TaskStore'
import { SignalHigh, SignalMedium, SignalLow, MoreHorizontal, AlertTriangle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
  task: Task
  onClick?: (task: Task) => void,
  canDrag?: boolean
}

const PriorityIcons = {
  "NO_PRIORITY": <MoreHorizontal className="w-4 h-auto text-gray-400" />,
  "LOW": <SignalLow className="w-4 h-auto" />,
  "MEDIUM": <SignalMedium className="w-4 h-auto" />,
  "HIGH": <SignalHigh className="w-4 h-auto" />,
  "URGENT": <AlertTriangle className="w-4 h-auto"/>,
}


const TaskCard: React.FC<TaskCardProps> = ({ task, onClick , canDrag }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(task)
    }
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`w-full bg-neutral-700/50 hover:bg-neutral-600/50 rounded-md transition-all duration-200 hover:shadow-md hover:scale-[1.02] p-3 mb-2 ${
        isDragging ? 'opacity-0' : ''
      } ${canDrag ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleClick}
      {...(canDrag ? listeners : {})} 
      {...(canDrag ? attributes : {})} 
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-md  font-medium text-white truncate mb-1">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-300 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {PriorityIcons[task.priority]}
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
