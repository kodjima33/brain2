"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

/**
 * Make sure all content is authenticated
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <main className="flex h-screen w-screen flex-col items-center gap-10 overflow-x-hidden p-5">
          {children}
        </main>
      </SignedIn>
    </>
  );
}
