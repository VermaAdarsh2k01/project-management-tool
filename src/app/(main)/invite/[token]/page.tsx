import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { acceptInvitation } from "@/app/actions/Invite";
import Link from "next/link";

export default async function InvitePage({ params }: { params: { token: string };
}) {
  const token = params.token;

  const invite = await prisma.invitation.findUnique({ where: { token } });
  if (!invite) return <ErrorPage title="Invalid" message="This invite is invalid or expired." />;

  const { userId } = await auth();
  if(!userId) redirect(`/sign-in?redirect_url=/invite/${token}`);

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (invite.email.toLowerCase() !== email?.toLowerCase()) {
    return (
      <ErrorPage
        title="invalid"
        message={`Your email doesnt match with the invited one - ${invite.email}`}
      />
    );
  }

  try {

    const res = await acceptInvitation(token, userId);
    if (res.success) redirect(`/project/${res.projectId}`);
    return <ErrorPage title="Invitation Error" message={res.error ?? "Unknown error"} />;

  } catch (error) {

    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error("Error accepting invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process invitation.";
    return <ErrorPage title="Server Error" message={errorMessage} />;

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
