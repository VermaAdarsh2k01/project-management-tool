"use client"

import { getTasksByProjectId } from '@/app/actions/Task'
import React, { useEffect, useTransition } from 'react'
import TaskNavbarContainer from './TaskNavbarContainer'
import TaskLists from './TaskLists'
import { useTaskStore } from '@/store/TaskStore'
import { Priority, Status } from '@prisma/client'

interface issuesData{
  title:string    
  description: string | null;
  status: Status
  priority: Priority
  dueDate?: Date | null;
  projectId: string;

}

interface IssuesContainerProps {
  issuesData: string;
  currentUserRole: string;
}
const IssuesContainer = ({issuesData, currentUserRole}: IssuesContainerProps) => {
  const { setTasks } = useTaskStore()
  const [, startTransition] = useTransition()
  

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'EDITOR'

  return (
    <div className='w-full h-full flex flex-col'>
        <div className='h-12 w-full flex items-center px-2 ' >
            {canEdit && <TaskNavbarContainer projectId={projectId} />}
        </div>
        <div className='w-full xl:min-h-[80vh] flex-1 rounded-lg bg-neutral-900/80 mt-2 '>
          <TaskLists  canEdit={canEdit}/>
        </div>
    </div>
  );
};

export default IssuesContainer;