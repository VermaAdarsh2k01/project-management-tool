import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { acceptInvitation } from "@/app/actions/Invite";

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const { userId } = await auth();

  if (!token) {
    return (
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invitation</h1>
        <p>This invitation link is invalid or has expired.</p>
        <Link href="/" className="text-blue-600 underline mt-4 inline-block">
          Go to Home
        </Link>
      </div>
    );
  }

  if (!userId) {
    // Not logged in → ask to sign in
    return (
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="mb-4">Please sign in to accept your invitation.</p>
        <Link 
          href={`/sign-in?redirect_url=${encodeURIComponent(`/invite?token=${token}`)}`} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  try {
    const res = await acceptInvitation(token, userId);
    
    if (res.success) {
      redirect(`/projects/${res.projectId}`);
    } else {
      return (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Error</h1>
          <p className="mb-4">{res.error}</p>
          <Link href="/" className="text-blue-600 underline">
            Go to Home
          </Link>
        </div>
      );
    }
  } catch (error) {
    return (
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="mb-4">There was an error processing your invitation.</p>
        <Link href="/" className="text-blue-600 underline">
          Go to Home
        </Link>
      </div>
    );
  }
}