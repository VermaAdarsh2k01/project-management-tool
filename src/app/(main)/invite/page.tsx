import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { acceptInvitation } from "@/app/actions/Invite";
import Link from "next/link";
import { AutoSignOut } from "@/components/AutoSignOut";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return <ErrorPage title="Invalid link" message="No token provided." />;
  }

  const invite = await prisma.invitation.findUnique({ where: { token } });

  if (!invite) {
    return <ErrorPage title="Invalid Invitation" message="Invitation not found or expired." />;
  }

  const { userId } = await auth();
  const user = await currentUser();

  // If not logged in → send them to the right Clerk page
  if (!userId) {
    const invitedUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    const redirectTo = invitedUser
      ? `/sign-in?redirect_url=/invite?token=${token}`
      : `/sign-up?redirect_url=/invite?token=${token}`;

    redirect(redirectTo);
  }

  // Logged in, check email match
  const invitedEmail = invite.email.toLowerCase();
  const loggedEmail = user?.emailAddresses?.[0]?.emailAddress.toLowerCase() ?? "";

  if (invitedEmail !== loggedEmail) {
    return <AutoSignOut invitedEmail={invitedEmail} redirectUrl={`/invite?token=${token}`} />;
  }

  try {
    const res = await acceptInvitation(token, userId);
    if (res.success) redirect(`/projects/`);

    return <ErrorPage title="Invitation Error" message={res.error ?? "Unknown error"} />;
  } catch {
    return <ErrorPage title="Server Error" message="Failed to process invitation." />;
  }
}

function ErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">{title}</h1>
      <p className="mb-4">{message}</p>
      <Link href="/" className="text-blue-600 underline">Go Home</Link>
    </div>
  );
}
