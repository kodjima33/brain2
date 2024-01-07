import { Redirect, Stack } from "expo-router";
import { SignedOut } from "@clerk/clerk-expo";

/**
 * Redirects to /auth if the user is not signed in.
 */
export default function AuthenticatedLayout() {
  return (
    <>
      <SignedOut>
        <Redirect href="/auth" />
      </SignedOut>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
        }}
      />
    </>
  );
}
