import ProjectLayout from "@/components/project/ProjectLayout";


export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <div className='flex items-center justify-center w-full h-full '>
            <ProjectLayout projectId={projectId}/>
        </div>
    )
}