"use client"

import React, { useEffect, useTransition } from 'react'
import TaskNavbarContainer from './TaskNavbarContainer'
import TaskLists from './TaskLists'
import { useTaskStore, Task } from '@/store/TaskStore'

interface IssuesContainerProps {
  issuesData: Task[];
  currentUserRole: string;
  projectId: string;
}
const IssuesContainer = ({issuesData, currentUserRole, projectId}: IssuesContainerProps) => {
  const { setTasks } = useTaskStore()
  const [, startTransition] = useTransition()
  
  useEffect(() => {
    setTasks(issuesData);
  }, [issuesData, setTasks]);

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