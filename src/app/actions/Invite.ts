"use server"

import { Role } from "@/generated/prisma"
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY || '',
})
export async function sendInvitation( email: string, role: Role, projectId: string)  {
    const user = await currentUser();
    
    if (!user || !user.emailAddresses.length) {
        throw new Error("User not authenticated or no email found");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
    }

    // Check if user is already a member or has pending invitation
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
        throw new Error("An invitation has already been sent to this email for this project");
    }

    const senderEmail = user.emailAddresses[0].emailAddress;
    const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Project Manager";

    const token = randomUUID();

    await prisma.invitation.create({
        data:{
            email,
            projectId, 
            token,
            role,
        }
    });

    const invitationURL = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    const sentFrom = new Sender(senderEmail, senderName);
    const recipients = [new Recipient(email, "Project Member")];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`${senderName} invited you to join a project`)
        .setHtml(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">You're invited to join a project!</h2>
                <p>Hi there,</p>
                <p><strong>${senderName}</strong> (${senderEmail}) has invited you to join a project with the role of <strong>${role.toLowerCase()}</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${invitationURL}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Accept Invitation
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If you can't click the button, copy and paste this link into your browser:<br>
                    <a href="${invitationURL}">${invitationURL}</a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This invitation was sent from our Project Management Tool. If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
        `);

    await mailerSend.email.send(emailParams);

    return { success: true };
}

export async function acceptInvitation(token: string , userId: string) {
    const invite = await prisma.invitation.findUnique({where: {token}});

    if( !invite ) return { success: false, error: "Invitation not found" };
    
    if( invite.accepted ) return { success: false, error: "Invitation has already been accepted" };

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
        where: { userId_projectId: { userId, projectId: invite.projectId } }
    });

    if (existingMembership) {
        // Mark invitation as accepted even if user is already a member
        await prisma.invitation.update({
            where: { token }, data: { accepted: true }
        });
        return { success: true, projectId: invite.projectId };
    }

    // Get current user to ensure email matches
    const user = await currentUser();
    if (!user || !user.emailAddresses.some(emailAddr => emailAddr.emailAddress === invite.email)) {
        return { success: false, error: "This invitation is for a different email address" };
    }

    // Create user record if it doesn't exist
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

    // Create membership
    await prisma.membership.create({
        data: { 
            userId, 
            projectId: invite.projectId, 
            role: invite.role 
        },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
        where: { token }, data: { accepted: true }
    });

    return { success: true , projectId: invite.projectId};
}
