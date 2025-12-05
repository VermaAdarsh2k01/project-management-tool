"use client"

import { Tabs, TabsTrigger ,TabsList, TabsContent } from '@radix-ui/react-tabs'
import React, { useState } from 'react'
import { BoxIcon, FileTextIcon, Layers2, Users } from 'lucide-react'
import OverviewSection from '../overview/OverviewSection'
import IssuesContainer from './IssuesContainer'
import MembersContainer from './MembersContainer'
import { Priority, Status } from '@prisma/client'
import { Member } from '@/store/MemberStore'
import { Task } from '@/store/TaskStore'

interface OverviewProps{
    id:string,
    name:string,
    summary:string,
    description:string,
    status:Status,
    priority:Priority,
    startDate:Date,
    targetDate:Date
}

    const ProjectTabsShell = ({ overviewData, issuesData, membersData, currentUserRole, projectId } : { overviewData: OverviewProps | null; issuesData: Task[]; membersData: Member[]; currentUserRole: string; projectId: string})=> {
    const [isActive, setIsActive] = useState("overview")
    
    return (
        <div className='flex items-start justify-center w-full h-full'>
            <Tabs defaultValue={isActive} onValueChange={setIsActive} className='w-full h-full'>
                <div className='w-full h-12 flex items-center justify-start gap-6 border-y px-4'>
                    <div className='flex items-center gap-2 h-full'>
                        <BoxIcon className='w-4 h-4' /> 
                        {/* <span>{project.name}</span> */}
                    </div>
                    <TabsList className="bg-transparent p-0 h-[70%]">
                        <div className='flex items-center gap-1 h-full'>
                            <TabsTrigger 
                                value="overview" 
                                className={`${isActive === "overview" ? "bg-neutral-800 border border-neutral-700 text-white" : "hover:bg-neutral-700"} flex items-center gap-2 rounded-lg px-3 transition-all duration-300 border-transparent`}
                                onClick={() => setIsActive("overview")}
                            >
                                <FileTextIcon className='w-4 h-4' />
                                <p>Overview</p>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="issues" 
                                className={`${isActive === "issues" ? "bg-neutral-800 border border-neutral-700 text-white" : "hover:bg-neutral-700"} flex items-center gap-2 rounded-lg px-3 transition-all duration-300 border-transparent`}
                                onClick={() => setIsActive("issues")}
                            >
                                <Layers2 className='w-4 h-4' />
                                <p>Issues</p>
                            </TabsTrigger>
                            <TabsTrigger
                                value="members"
                                className={`${isActive === "members" ? "bg-neutral-800 border border-neutral-700 text-white" : "hover:bg-neutral-700"} flex items-center gap-2 rounded-lg px-3 transition-all duration-300 border-transparent`}
                                onClick={() => setIsActive("members")}
                            >
                                <Users className='w-4 h-4' />
                                <p>Members</p>
                            </TabsTrigger>
                        </div>
                    </TabsList>
                </div>
                
                <TabsContent value="overview" className='w-full h-[80%] flex items-center justify-center'>
                    <OverviewSection overviewData={overviewData} currentUserRole={currentUserRole}/>
                </TabsContent>
                <TabsContent value="issues">
                    <IssuesContainer issuesData={issuesData} currentUserRole={currentUserRole} projectId={projectId} />
                </TabsContent>
                <TabsContent value = "members">
                    <MembersContainer membersData={membersData} currentUserRole={currentUserRole} projectId={projectId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProjectTabsShell
