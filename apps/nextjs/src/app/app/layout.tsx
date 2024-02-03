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
      <SignedIn>{children}</SignedIn>
    </>
  );
}
