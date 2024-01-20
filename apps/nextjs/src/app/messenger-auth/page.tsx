"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function MessengerAuth() {
  const searchParams = useSearchParams();

  const accountLinkingToken = searchParams.get("account_linking_token");
  const redirectURI = searchParams.get("redirect_uri");

  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    console.log(isLoaded, isSignedIn, user);
  }, [isLoaded, isSignedIn, user]);
  return (
    <div>
      <h1>
        {accountLinkingToken}, {redirectURI}, {user?.id}
      </h1>
    </div>
  );
}
