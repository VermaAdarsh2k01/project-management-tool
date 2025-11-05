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


}