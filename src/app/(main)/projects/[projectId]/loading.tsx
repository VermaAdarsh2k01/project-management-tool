import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex items-start justify-center w-full h-full">
            {/* Tabs Header Skeleton */}
            <div className="w-full h-full">
                <div className="w-full h-12 flex items-center justify-start gap-6 border-y px-4">
                    <div className="flex items-center gap-2 h-full">
                        <Skeleton className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 h-full">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>

                {/* Overview Content Skeleton */}
                <div className="w-full h-[80%] flex items-center justify-center">
                    <div className="bg-white dark:bg-transparent rounded-lg p-6 max-w-5xl h-full flex items-center">
                        <div className="w-full">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <Skeleton className="h-9 w-20" />
                            </div>

                            <div className="space-y-6">
                                {/* Project Name Skeleton */}
                                <div>
                                    <Skeleton className="h-10 w-80 max-w-full" />
                                </div>

                                {/* Summary Skeleton */}
                                <div>
                                    <Skeleton className="h-5 w-96 max-w-full" />
                                </div>

                                {/* Metadata Row - Status, Priority, Dates */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Status pill */}
                                    <Skeleton className="h-8 w-24 rounded-md" />
                                    {/* Priority pill */}
                                    <Skeleton className="h-8 w-28 rounded-md" />
                                    {/* Start Date pill */}
                                    <Skeleton className="h-8 w-32 rounded-md" />
                                    {/* Target Date pill */}
                                    <Skeleton className="h-8 w-32 rounded-md" />
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200 dark:border-neutral-800"></div>

                                {/* Description Section */}
                                <div>
                                    <Skeleton className="h-6 w-32 mb-3" />
                                    <Skeleton className="min-h-[120px] w-full rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}