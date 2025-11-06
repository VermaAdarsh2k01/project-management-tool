"use server"

import { Role } from "@/generated/prisma"
import { Resend } from "resend"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)
export async function sendInvitation( email: string, role: Role, projectId: string)  {

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

    await resend.emails.send({
        from: "adarshatwork251@gmail.com",
        to: email,
        subject: "Invitation to join the project",
        html: `
            <p>You’ve been invited to join a project.</p>
            <p><a href="${invitationURL}">Click here to accept the invitation</a>.</p>
        `,
    });

    return { success: true };
}

export async function acceptInvitation(token: string , userId: string) {
    const invite = await prisma.invitation.findUnique({where: {token}});

    if( !invite ) return { success: false, error: "Invitation not found" };

    const user = await prisma.user.upsert({
        where: { id: userId },
        update:{},
        create:{ id: userId , email: invite.email },
    })

    await prisma.membership.upsert({
        where: { userId_projectId: { userId, projectId: invite.projectId } },
        update:{},
        create:{ userId, projectId: invite.projectId, role: invite.role },
    })

    await prisma.invitation.update({
        where: { token }, data: { accepted: true }
    })

    return { success: true , projectId: invite.projectId}
}
