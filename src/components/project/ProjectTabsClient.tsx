"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import React, { useState } from 'react'
import OverviewSection from './OverviewSection'
import { BoxIcon } from 'lucide-react'
import { Priority, Status } from '@/generated/prisma/client'

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

interface ProjectTabsClientProps {
    project: ProjectData;
}

const ProjectTabsClient = ({ project }: ProjectTabsClientProps) => {
    const [isActive, setIsActive] = useState("overview")

    return (
        <div className='flex items-start justify-center w-full h-full'>
            <Tabs defaultValue={isActive} className='w-full h-full'>
                <div className='w-full h-12 flex items-center justify-start gap-6 border-y'>
                    <div className='flex items-center gap-2 pr-2 h-full'>
                        <BoxIcon className='w-4 h-4' /> 
                        <span>{project.name}</span>
                    </div>
                    <TabsList className='w-fit h-[70%] flex justify-center gap-1'>
                        <div 
                            className={`w-full h-full rounded-lg px-4 flex items-center justify-center transform-all duration-300 ${isActive === "overview" ? "bg-neutral-800 border border-neutral-700" : "hover:bg-neutral-700"}`} 
                            onClick={() => setIsActive("overview")}
                        >
                            <TabsTrigger value="overview" className={`${isActive === "overview" ? "text-white" : ""}`}>
                                Overview
                            </TabsTrigger>
                        </div>
                        <div 
                            className={`w-full h-full rounded-lg px-4 flex items-center justify-center transform-all duration-300 ${isActive === "issues" ? "bg-neutral-800 border border-neutral-700" : "hover:bg-neutral-700"}`} 
                            onClick={() => setIsActive("issues")}
                        >
                            <TabsTrigger value="issues" className={`${isActive === "issues" ? "text-white" : ""}`}>
                                Issues
                            </TabsTrigger>  
                        </div>
                    </TabsList>
                </div>
                
                <TabsContent value="overview" className='w-full h-[80%] flex items-center justify-center'>
                    <OverviewSection project={project}/>
                </TabsContent>
                <TabsContent value="issues">
                    <div>Issues</div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProjectTabsClient
