"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

export async function removeMember( memberId :string , projectId: string) {
    const user = await currentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }   

    const currentUserMembership = await prisma.membership.findUnique({
        where:{
            userId_projectId:{
                userId : user.id,
                projectId
            }
        }
    }) 

    const project = await prisma.project.findUnique({
        where: {id : projectId }
    })

    const isOwner = project?.ownerId === user.id;

    const currentUserRole = currentUserMembership?.role === Role.ADMIN || currentUserMembership?.role === Role.EDITOR || isOwner;
    
    if (!currentUserRole) {
        throw new Error("You don't have permission to remove members from this project");
    }

    const targetUserMembership = await prisma.membership.findUnique({
        where:{
            id:memberId
        }
    })

    if (targetUserMembership?.id === project?.ownerId) throw new Error("Can not remove the Owner of the project");

    await prisma.membership.delete({
        where:{
            id:memberId
        }
    })
    
    // Invalidate cache after removing member
    const cachekey = `projects:${projectId}:members`;
    await cacheDelete(cachekey);
    
    return { success: true };
       
}

export async function updateMemberRole( memberId:string ,projectId:string , newRole:Role){
    const user = await currentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const currentUserMembership = await prisma.membership.findUnique({
        where:{
            userId_projectId:{
                userId : user.id,
                projectId
            }
        }
    })

    const project = await prisma.project.findUnique({
        where: {id : projectId }
    })

    const isOwner = project?.ownerId === user.id;
    const canManageMembers = currentUserMembership?.role === Role.ADMIN || isOwner;

    if (!canManageMembers) {
        throw new Error("You don't have permission to change member roles in this project");
    }

    const targetMembership = await prisma.membership.findUnique({
        where: { id: memberId },
        include: { user: true }
    });

    if (!targetMembership) {
        throw new Error("Member not found");
    }

    if (targetMembership.userId === project?.ownerId) {
        throw new Error("Cannot change the role of the project owner");
    }

    const updatedMembership = await prisma.membership.update({
        where: { id: memberId },
        data: { role: newRole },
        include: { user: true }
    })
    
    // Invalidate cache after updating member role
    const cachekey = `projects:${projectId}:members`;
    await cacheDelete(cachekey);

    return { success: true, member: updatedMembership };
} 

export async function getMemebersbyProjectId({projectId}:{projectId:string}){
    const {userId} = await auth()
    if(!userId) throw new Error("User not authenticated")

    const user = await currentUser()
    if(!user) throw new Error("No user found")

    const cachekey= `projects:${projectId}:members`

    const redisData = await cacheGet(cachekey)
    if(redisData) return redisData

    const response = await prisma.membership.findMany({
        where:{
            projectId: projectId
        },
        select:{
            id: true,
            userId: true,
            role: true,
            user:{
                select:{
                    id: true,
                    name: true,
                    email: true
                }
            },
        }
    })
    
    // Cache the fetched data
    if (response) {
        await cacheSet(cachekey, response, 200);
    }

    return response
}