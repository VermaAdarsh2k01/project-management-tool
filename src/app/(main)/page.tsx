import { SyncUser } from "@/app/actions/User";
import { ProjectCountCard, ProjectCountCardSkeleton } from "@/components/dashboard/ProjectCountCard";
import { ProjectTimelineChartWrapper, ProjectTimelineChartSkeleton } from "@/components/dashboard/ProjectTimelineChartWrapper";
import { Suspense } from "react";

export default async function Home() {

    try{
        await SyncUser();
    }catch(err) {
        console.error("Error syncing user:", err);
    }
    
    return (
        <div className="bg-[#101012] min-h-screen w-screen text-white p-8">
        <div className="flex justify-between items-center mb-8">
            
        </div>
        
        <div className="max-w-5xl mx-auto">
            <h2 className="text-xl mb-4">Welcome!</h2>
            <p className="text-gray-300 mb-4">
                This is a Project management Tool. Feel free to create as many Projects , add issues into each project .
                You will see all the projects that you either own or a member of.
            </p>
            
            <Suspense fallback={<ProjectCountCardSkeleton />}>
                <ProjectCountCard />
            </Suspense>

            <Suspense fallback={<ProjectTimelineChartSkeleton />}>
                <ProjectTimelineChartWrapper />
            </Suspense>
        </div>
        </div>
    );
}