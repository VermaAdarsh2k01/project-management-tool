"use server"

import { cacheDelete, cacheGet, cacheSet } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { Priority, Status } from "@prisma/client";

export type updateProp = {
  name: string;
  summary: string | null;
  description: string | null;
  status: Status;
  priority: Priority;
  startDate: Date | null;
  targetDate: Date | null;
};

export async function GetOverviewData({projectId}:{projectId:string}){
    const {userId} = await auth();
    if( !userId ) throw new Error("User isnt authenticated");

    const cachekey = `projects:${projectId}:overview`;
    
    const redisData = await cacheGet(cachekey);
    if(redisData) return redisData;

    const responseData = await prisma.project.findUnique({
        where: {
            id:projectId
        },
        select:{
            id:true,
            name:true,
            summary:true, 
            description:true,
            status:true,
            priority:true,
            startDate:true,
            targetDate:true,
        }
    })
    
    if (responseData) {
        await cacheSet(cachekey, responseData, 200);
    }

    return responseData;
}

export async function UpdateOverviewData( {projectId , data}:{projectId:string ,data:updateProp} ){
    const {userId} = await auth();
    if( !userId ) throw new Error("User isnt authenticated");
    
    if(!projectId) throw new Error("No project found");
    
    const cachekey = `projects:${projectId}:overview`;
    
    const response = await prisma.project.update({
        where:{
            id: projectId
        },
        data:{
            name:data.name,
            summary:data.summary,
            description:data.description,
            status:data.status,
            priority:data.priority,
            startDate:data.startDate,
            targetDate:data.targetDate
        },
        select:{
            name: true,
            summary: true,
            description: true,
            status: true,
            priority: true,
            startDate: true,
            targetDate: true,
            
        }
    })

    await cacheDelete(cachekey)
    await cacheSet(cachekey , response , 200 )

    return response;
}