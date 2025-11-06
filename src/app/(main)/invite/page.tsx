// import { acceptInvitation } from "@/app/actions/invite";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { acceptInvitation } from "@/app/actions/Invite";
export default async function InvitePage({ searchParams }: { searchParams: { token?: string } }) {
  const { token } = searchParams;
  const { userId } = await auth();

  if (!token) return <p>Invalid invitation link.</p>;

  if (!userId) {
    // Not logged in → ask to sign in
    return (
      <div className="text-center p-6">
        <p className="mb-4">Please sign in to accept your invitation.</p>
        <Link href={`/sign-in?redirect_url=/invite?token=${token}`} className="text-blue-400 underline">
          Sign In
        </Link>
      </div>
    );
  }
    const res = await acceptInvitation( token , userId )
    
    if( res.success ) redirect(`/projects/${res.projectId}`) 
  
}