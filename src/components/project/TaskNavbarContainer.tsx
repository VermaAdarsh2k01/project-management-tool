"use client"
import React,{useState} from 'react'
import { Status, Priority } from '@/generated/prisma';
import { useTaskStore } from '@/store/TaskStore';
import { useTransition } from 'react';
import { createTask } from '@/app/actions/Task';
import { toast } from 'sonner';
import { Modal, ModalTrigger, ModalBody, ModalContent } from '../ui/animated-modal';
import { PlusIcon } from 'lucide-react';
import TaskForm from './TaskForm';

const TaskNavbarContainer = ({projectId}: {projectId: string}) => {
  const[ title, setTitle] = useState("");
  const[ description, setDescription] = useState("");
  const[ status, setStatus] = useState<Status>("BACKLOG");
  const[ priority, setPriority] = useState<Priority>("NO_PRIORITY");
  const[ dueDate, setDueDate] = useState<Date | null>(null);  

  const [isPending, startTransition] = useTransition();
  const { addTask , updateTask , removeTask } = useTaskStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const optimisticTask = {
      id: `temp-${Math.random().toString(36)}`,
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      createdAt: new Date(),
    }
    
    startTransition(async () => {

      addTask(optimisticTask);
      
      try{  
        const newTask = await createTask({
          title,
          description,
          status,
          priority,
          dueDate,
          projectId,
        });
        
        removeTask(optimisticTask.id);
        addTask(newTask);
        toast.success("Task created successfully");
      } catch (error) {
        console.error("Error creating task:", error);
        removeTask(optimisticTask.id);
        toast.error("Failed to create task");
      }
    });
  };
  return (  
    <>
      <div className='flex items-center justify-center '>
        <Modal>
            <ModalTrigger className='flex items-center gap-2 justify-center rounded-lg border bg-muted-foreground dark:hover:bg-muted-foreground/80 px-3 py-1'>
                <PlusIcon className='w-4 h-4 text-neutral-900 ' />
                <h4 className="text-lg md:text-sm text-neutral-600 dark:text-neutral-900  text-center font-medium">
                    New Task{" "}
                </h4>
            </ModalTrigger>
            <ModalBody>
                <ModalContent className="p-6">
                    <TaskForm projectId={projectId} />
                </ModalContent>
            </ModalBody>
        </Modal>
    </div>    
    </>

  )
}

export default TaskNavbarContainer
