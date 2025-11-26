"use client"

import { UserButton } from "@clerk/nextjs";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./ui/sidebar";
import { Suspense, useEffect, useState, useTransition } from "react";
import { Box, Home, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useProjectStore } from "@/store/ProjectStore";
import { GetProjectLists } from "@/app/actions/Project";
import { Skeleton } from "./ui/skeleton";

interface SidebarItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

export default function AppSidebar() {
    const [isMounted, setIsMounted] = useState(false);
    const { projects, setProjects, shouldRefetchProjects, clearProjectsRefetch } = useProjectStore();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!shouldRefetchProjects && projects.length > 0) return;

        startTransition(async () => {
            const projectData = await GetProjectLists();
            setProjects(projectData);
            clearProjectsRefetch();
        });
    }, [shouldRefetchProjects, projects.length, setProjects, clearProjectsRefetch]);

    const sidebarMenu: SidebarItem[] = [
        {
            title: "Home",
            url: "/",
            icon: Home,
        },
        {
            title: "Projects",
            url: "/projects",
            icon: Box,
        },
        
    ];

    return (
        <Sidebar >
            <SidebarHeader className="text-xl font-bold">
                Linear Clone
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="px-2 mt-12">
                    {
                        sidebarMenu.map((item: SidebarItem) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url} className="flex items-center gap-2">
                                        <item.icon className="h-6 w-6" strokeWidth={1.5} />
                                        <span className="text-lg">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                
                                {item.title === "Projects" && (
                                    <Suspense fallback={
                                        <SidebarMenuSub>
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <SidebarMenuSubItem key={i}>
                                                    <SidebarMenuSubButton>
                                                        <Skeleton className="h-4 w-24" />
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    }>
                                        {isPending ? (
                                            <SidebarMenuSub>
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <SidebarMenuSubItem key={i}>
                                                        <SidebarMenuSubButton>
                                                            <Skeleton className="h-4 w-24" />
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        ) : projects.length > 0 ? (
                                            <SidebarMenuSub>
                                                {projects.map((project) => (
                                                    <SidebarMenuSubItem key={project.id}>
                                                        <SidebarMenuSubButton asChild>
                                                            <Link href={`/projects/${project.id}`}>
                                                                <span>{project.name}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        ) : null}
                                    </Suspense>
                                )}
                            </SidebarMenuItem>
                        ))
                    }
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mb-4">
                <Suspense fallback={<div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />}>
                    {isMounted && <UserButton/> }
                </Suspense>
            </SidebarFooter>
        </Sidebar>
    )
}