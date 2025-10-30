"use client"
import React, { useState } from 'react'
import { TabsTrigger } from '../ui/tabs'
import { FileTextIcon, Layers2 } from 'lucide-react'

const ProjectTabsSwitcher = () => {
  const [isActive, setIsActive] = useState("overview")
  return (
    <>
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
    </div>
    </>
  )
}

export default ProjectTabsSwitcher
