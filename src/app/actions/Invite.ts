"use server"

import { Role } from "@prisma/client"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
export async function sendInvitation( email: string, role: Role, projectId: string)  {
    const user = await currentUser();
    
    if (!user || !user.emailAddresses.length) {
        throw new Error("User not authenticated or no email found");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
    }

    const existingMember = await prisma.membership.findUnique({
        where: { userId_projectId: { userId: user.id, projectId } }
    });

    if (!existingMember) {
        throw new Error("You don't have permission to invite members to this project");
    }

    const existingInvitation = await prisma.invitation.findFirst({
        where: { 
            email, 
            projectId,
            accepted: false 
        }
    });

    if (existingInvitation) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingInvitation.createdAt < fiveMinutesAgo) {
            await prisma.invitation.delete({
                where: { id: existingInvitation.id }
            });
        } else {
            throw new Error("An invitation has already been sent to this email for this project");
        }
    }

    const senderEmail = user.emailAddresses[0].emailAddress;
    const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Project Manager";

    const token = randomUUID();
    const invitationURL = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;

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

Click here to accept the invitation: ${invitationURL}

If you can't click the link, copy and paste this URL into your browser:
${invitationURL}

Best regards,
Project Management Team`,
            reply_to: senderEmail
        }
    };
}

export async function createInvitationRecord(invitationData: {
    email: string;
    projectId: string;
    token: string;
    role: Role;
}) {
    await prisma.invitation.create({
        data: invitationData
    });
    return { success: true };
}

export async function acceptInvitation(token: string , userId: string) {
    const invite = await prisma.invitation.findUnique({where: {token}});

    if( !invite ) return { success: false, error: "Invitation not found" };
    
    if( invite.accepted ) return { success: false, error: "Invitation has already been accepted" };

    const existingMembership = await prisma.membership.findUnique({
        where: { userId_projectId: { userId, projectId: invite.projectId } }
    });

    if (existingMembership) {
        await prisma.invitation.update({
            where: { token }, data: { accepted: true }
        });
        return { success: true, projectId: invite.projectId };
    }

    const user = await currentUser();
    if (!user || !user.emailAddresses.some(emailAddr => emailAddr.emailAddress === invite.email)) {
        return { success: false, error: "This invitation is for a different email address" };
    }

    await prisma.user.upsert({
        where: { id: userId },
        update: {
            email: invite.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        },
        create: { 
            id: userId, 
            email: invite.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        },
    });

    await prisma.membership.create({
        data: { 
            userId, 
            projectId: invite.projectId, 
            role: invite.role 
        },
    });


    await prisma.invitation.update({
        where: { token }, data: { accepted: true }
    });

    return { success: true , projectId: invite.projectId};
}