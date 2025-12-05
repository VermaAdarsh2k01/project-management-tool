"use client"

import { Task } from '@/store/TaskStore'
import { CircleCheck, CircleDashed, CircleDot, Loader } from 'lucide-react'
import TaskCard from './TaskCard'
import { useTaskStore } from '@/store/TaskStore'
import { DndContext, DragEndEvent, DragStartEvent, useDroppable, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Status } from '@prisma/client'
import { useState } from 'react'
import { updateTask as updateTaskAction } from '@/app/actions/Task'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Modal, ModalContent, ModalBody, ModalTrigger } from '../ui/animated-modal'
import EditTaskForm from './EditTaskForm'


const DroppableColumn = ({ column, children }: { column: string, children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({
        id: column,
    });

    return (
        <div ref={setNodeRef} className='col-span-1 h-full overflow-hidden'>
            <div className='w-full h-full bg-neutral-800/50 rounded-lg'>
                {children}
            </div>
        </div>
    );
};

const TaskLists = ({ canEdit }: { canEdit: boolean }) => {
    const Columns = ["Backlog", "Todo", "In Progress", "Done"];
    const { tasks, updateTask } = useTaskStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isPending, startTransition] = useTransition();

   
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, 
            },
        })
    );

    const StatusIcons = {
        "Backlog": <CircleDashed color="#ffffff" size={15} />,
        "Todo": <Loader color="#2f58fe" size={15} />,
        "In Progress": <CircleDot color="#ffef42" size={15} />,
        "Done": <CircleCheck color="#4dfe50" size={15} />,
    }

    const StatusMapping = {
        "Backlog": "BACKLOG",
        "Todo": "TODO",
        "In Progress": "IN_PROGRESS",
        "Done": "DONE",
    }

    const getTasksForColumn = (column: string) => {
        const status = StatusMapping[column as keyof typeof StatusMapping];
        return tasks.filter((task) => task.status === status);
    };


    const handleDragStart = (event: DragStartEvent) => {

        if (!canEdit)   return;
        
        const { active } = event;
        const taskId = active.id as string;
        const task = tasks.find(t => t.id === taskId);
        setActiveTask(task || null);
    }

    const handleDragEnd = (event: DragEndEvent) => {
        
        if (!canEdit)   return;
        
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        const newColumnName = over.id as string;
        

        const newStatus = StatusMapping[newColumnName as keyof typeof StatusMapping] as Status;
        
        const task = tasks.find(t => t.id === taskId);
        
        if (task && task.status !== newStatus) {
            const previousStatus = task.status;
            
            updateTask(taskId, { status: newStatus });
            
            startTransition(async () => {
                try {
                    await updateTaskAction(taskId, { status: newStatus });
                    toast.success("Task updated successfully");
                } catch (error) {
                    // Revert optimistic update on error
                    updateTask(taskId, { status: previousStatus });
                    console.error("Error updating task:", error);
                    toast.error("Failed to update task");
                }
            });
        }
        
        setActiveTask(null);
    }

    // Conditionally wrap with DndContext based on permissions
    const content = (
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-4 gap-2 p-1 '>
            {Columns.map((column) => {
                return (
                    <DroppableColumn key={column} column={column}>
                        <div className='flex items-center justify-start gap-2 w-full h-fit p-3'>
                            {StatusIcons[column as keyof typeof StatusIcons] as React.ReactNode}
                            <h2 className='text-base'>{column}</h2>
                        </div>
                        <div className='px-3 pb-3 max-h-[calc(100vh-200px)] overflow-y-auto'>
                            
                            {getTasksForColumn(column).map((task) => (
                                <Modal key={task.id}>
                                    <ModalTrigger className='w-full h-full text-left px-0 py-0' >
                                            <TaskCard task={task} canDrag={canEdit} />
                                    </ModalTrigger>
                                    <ModalBody>
                                        <ModalContent>
                                            <EditTaskForm task={task} />
                                        </ModalContent>
                                    </ModalBody>
                                </Modal>
                            ))}
                        </div>
                    </DroppableColumn>
                )
            })}
        </div>
    );

    // Only enable DndContext if user can edit
    if (canEdit) {
        return (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {content}
                <DragOverlay>
                    {activeTask ? (
                        <div className="rotate-3 transform">
                            <TaskCard task={activeTask} canDrag={true} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        );
    }

    return content;
}

export default TaskLists