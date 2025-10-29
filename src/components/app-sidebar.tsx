"use client"

import { UserButton } from "@clerk/nextjs";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Suspense, useEffect, useState } from "react";
import { Box, Home, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SidebarItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

export default function AppSidebar() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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