"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

interface AutoSignOutProps {
  invitedEmail: string;
  redirectUrl: string;
}

export function AutoSignOut({ invitedEmail, redirectUrl }: AutoSignOutProps) {
  const { signOut } = useClerk();

  useEffect(() => {
    // Immediately sign out and redirect
    signOut({
      redirectUrl: "/sign-in?redirect_url=/"
    });
  }, [signOut, redirectUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Switching Accounts</h1>
        <p className="text-gray-600 mb-2">
          This invitation is for <strong>{invitedEmail}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Signing you out to use the correct account...
        </p>
      </div>
    </div>
  );
}
