import { GetProjectTimeline } from "@/app/actions/Project";
import ProjectTimelineChart from "./ProjectTimelineChart";
import { TrendingUp } from "lucide-react";

export function ProjectTimelineChartSkeleton() {
    return (
        <div className="mt-6 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg">
            <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-500 animate-pulse" />
                    <div className="h-6 w-48 bg-neutral-800 rounded animate-pulse"></div>
                </div>
                
                <div className="w-full h-[300px] flex flex-col justify-between py-4">
                    <div className="space-y-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-neutral-800 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-32 mx-8 relative">
                            <svg className="w-full h-full opacity-20">
                                <polyline
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="2"
                                    points="0,100 100,80 200,60 300,70 400,40 500,30"
                                    className="animate-pulse"
                                />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="flex justify-between mt-4 px-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-3 w-12 bg-neutral-800 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function ProjectTimelineChartWrapper() {
    const timelineData = await GetProjectTimeline();
    
    if (timelineData.length === 0) {
        return null;
    }
    
    return (
        <div className="mt-6 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg">
            <ProjectTimelineChart data={timelineData} />
        </div>
    );
}
