
import { getMemebersbyProjectId } from "@/app/actions/Membership";
import { GetOverviewData } from "@/app/actions/Overview";
import { getTasksByProjectId } from "@/app/actions/Task";
import { UserRole } from "@/app/actions/User";
import ProjectTabsShell from "@/components/project/ProjectTabsShell";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    
    const { projectId } = await params;
    const currentUserRole = await UserRole({projectId})
    const overviewData = await GetOverviewData({projectId});
    const issuesData = await getTasksByProjectId(projectId);
    const memberData = await getMemebersbyProjectId({projectId})
    return (
        <div className="h-full">
            <ProjectTabsShell 
                overviewData={overviewData} 
                issuesData={issuesData}
                membersData={memberData}
                currentUserRole={currentUserRole}
                projectId={projectId}
            />
        </div>
)
}