"use client"

import { getTasksByProjectId } from '@/app/actions/Task'
import React, { useEffect, useTransition } from 'react'
import TaskNavbarContainer from './TaskNavbarContainer'
import TaskLists from './TaskLists'
import { useTaskStore } from '@/store/TaskStore'

const IssuesContainer = ({projectId}: {projectId: string}) => {
  const { setTasks } = useTaskStore()
  const [, startTransition] = useTransition()
  
  useEffect(() => {
    startTransition(async () => {
      const taskData = await getTasksByProjectId(projectId)
      setTasks(taskData)
    })
  }, [projectId, setTasks])

  return (
    <div className='w-full h-full flex flex-col'>
        <div className='h-12 w-full flex items-center px-2 ' >
            <TaskNavbarContainer projectId={projectId} />
        </div>
        <div className='w-full xl:min-h-[80vh] flex-1 rounded-lg bg-neutral-900/80 mt-2 '>
          <TaskLists  />
        </div>
    </div>
  );
};

export default IssuesContainer;