import { Redirect, Stack } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";

/**
 * Redirects to /index if the user is signed in.
 */
export default function AuthenticatedLayout() {
  return (
    <>
      <SignedIn>
        <Redirect href="/" />
      </SignedIn>
      <SignedOut>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
          }}
        />
      </SignedOut>
    </>
  );
}
