"use server"
import { prisma } from "@/lib/prisma";
import {auth , currentUser} from "@clerk/nextjs/server"

export async function SyncUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const clerkUser = await currentUser();

  if (!clerkUser || !clerkUser.emailAddresses.length) {
    throw new Error("Invalid Clerk user data.");
  }

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
}