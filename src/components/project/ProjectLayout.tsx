import React from 'react'
import { GetProjectById } from '@/app/actions/Project'
import ProjectTabsClient from './ProjectTabsClient'

const ProjectLayout = async ({projectId}: {projectId: string}) => {
    const project = await GetProjectById(projectId)

    return <ProjectTabsClient project={project} />
}

export default ProjectLayout