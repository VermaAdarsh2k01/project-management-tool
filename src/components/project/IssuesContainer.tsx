
import { createTask } from '@/app/actions/Task'
import { Priority, Status } from '@/generated/prisma';
import React, { useState, useTransition } from 'react'
import { useTaskStore } from '@/store/TaskStore'
import { toast } from 'sonner';
import TaskNavbarContainer from './TaskNavbarContainer'


const IssuesContainer = ({projectId}: {projectId: string}) => {
  

  return (
    <div className='w-full h-full flex items-center justify-center'>
        <div className='h-12 w-full flex items-center px-2'>
            <TaskNavbarContainer projectId={projectId} />
        </div>
        <div>
          
        </div>
    </div>
  );
};

export default IssuesContainer;