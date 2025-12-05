"use server"
import { prisma } from "@/lib/prisma";
import {auth , currentUser} from "@clerk/nextjs/server"

export async function SyncUser() {
  try {
    const { userId } = await auth();

    // If no userId, just return silently (user not logged in yet)
    if (!userId) {
      return { success: false, reason: "Not authenticated" };
    }

    const clerkUser = await currentUser();

    // If Clerk data is invalid, return silently
    if (!clerkUser || !clerkUser.emailAddresses.length) {
      return { success: false, reason: "Invalid Clerk data" };
    }

    // Try to sync, but don't crash if it fails
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      },
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      },
    });

    return { success: true };
  } catch (error) {
    // Log the error but don't crash the page
    console.error("SyncUser failed:", error);
    return { success: false, reason: "Database error" };
  }
}

export async function UserRole({projectId} : {projectId:string}) {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error("user not authenticated")

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("user not found")
  
  const response = await prisma.membership.findUnique({
    where: {
      userId_projectId :{
      userId: authUserId,
      projectId: projectId
      },
    },
    select:{
      role:true
    }
  })

  if(!response) throw new Error("Couldnt getch members")

  return response.role
}