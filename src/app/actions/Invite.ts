"use server"

import { Role } from "@prisma/client"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
export async function sendInvitation(email: string, role: Role, projectId: string) {
  const user = await currentUser();
  if (!user || !user.emailAddresses.length) {
    throw new Error("User not authenticated");
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    throw new Error("Enter a valid email address");
  }

  const inviterMembership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!inviterMembership) {
    throw new Error("You do not have permission to invite members to this project");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: { 
        userId_projectId: { userId: existingUser.id, projectId } 
      }
    });

    if (existingMembership) {
      throw new Error("This user is already a member of the project");
    }
  }

  const existing = await prisma.invitation.findFirst({
    where: { email, projectId, accepted: false }
  });

  if (existing) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (existing.createdAt < fiveMinutesAgo) {
      await prisma.invitation.delete({ where: { id: existing.id } });
    } else {
      throw new Error("An invitation has already been sent to this email.");
    }
  }

  const senderEmail = user.emailAddresses[0].emailAddress;
  const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Project Manager";

  const token = randomUUID();
  const invitationURL = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

  return {
    success: true,
    invitationData: {
      email,
      projectId,
      token,
      role,
    },
    emailData: {
      to_name: email,
      from_name: senderName,
      message: `Hello,

${senderName} has invited you to join a project with the role of ${role.toLowerCase()}.

Click here to accept the invitation:
${invitationURL}

If you can't click the link, copy and paste this URL into your browser:
${invitationURL}

Best regards,
Project Management Team`,
      reply_to: senderEmail,
    },
  };
}

export async function createInvitationRecord(data: {
  email: string;
  projectId: string;
  token: string;
  role: Role;
}) {
  await prisma.invitation.create({ data });
  return { success: true };
}

export async function acceptInvitation(token: string , userId: string) {
    const invite = await prisma.invitation.findUnique({where: {token}});

    if( !invite ) return { success: false, error: "Invitation not found" };
    
    if( invite.accepted ) return { success: false, error: "Invitation has already been accepted" };

    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress.toLowerCase();
    if (userEmail !== invite.email.toLowerCase()) {
        return { success: false, error: "This invitation is for a different email address" };
    }

    await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: invite.email,
      name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
    },
    create: {
      id: userId,
      email: invite.email,
      name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
    },
  });

    const existingMembership = await prisma.membership.findUnique({
        where: { 
            userId_projectId: { userId, projectId: invite.projectId } 
        }
    });

    if (!existingMembership) {
        await prisma.membership.create({
            data: {
                userId,
                projectId: invite.projectId,
                role: invite.role
            }
        });
    }

    await prisma.invitation.update({
        where: { token }, data: { accepted: true }
    });

    return { success: true , projectId: invite.projectId};
}