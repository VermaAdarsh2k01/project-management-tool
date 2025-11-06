"use client"

import { Tabs, TabsContent, TabsList } from '@radix-ui/react-tabs'
import React, { useState } from 'react'
import OverviewSection from './OverviewSection'
import { BoxIcon } from 'lucide-react'
import { Priority, Status, Role } from '@/generated/prisma/client'
import { FileTextIcon , Layers2 } from 'lucide-react'
import IssuesContainer from './IssuesContainer'
import ProjectTabsSwitcher from './ProjectTabsSwitcher'
import MembersContainer from './MembersContainer'

interface ProjectData {
    id: string
    name: string
    summary: string | null
    description: string | null
    status: Status
    priority: Priority
    startDate: Date | null
    targetDate: Date | null
    ownerId: string
    createdAt: Date
    updatedAt: Date
    currentUserRole: string
    memberships: Array<{
        id: string
        userId: string
        projectId: string
        role: Role
        user: {
            id: string
            name: string | null
            email: string
            createdAt: Date
        }
    }>
}

interface ProjectTabsClientProps {
    project: ProjectData;
}

const ProjectTabsClient = ({ project }: ProjectTabsClientProps) => {
    const {id: projectId} = project
    const [isActive, setIsActive] = useState("overview")

    return (
        <div className='flex items-start justify-center w-full h-full'>
            <Tabs defaultValue={isActive} className='w-full h-full'>
                <div className='w-full h-12 flex items-center justify-start gap-6 border-y px-4'>
                    <div className='flex items-center gap-2 h-full'>
                        <BoxIcon className='w-4 h-4' /> 
                        <span>{project.name}</span>
                    </div>
                    <TabsList className="bg-transparent p-0 h-[70%]">
                        <ProjectTabsSwitcher />
                    </TabsList>
                </div>
                
                <TabsContent value="overview" className='w-full h-[80%] flex items-center justify-center'>
                    <OverviewSection project={project}/>
                </TabsContent>
                <TabsContent value="issues">
                    <IssuesContainer projectId={projectId} />
                </TabsContent>
                <TabsContent value = "members">
                    <MembersContainer project={project} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProjectTabsClient
