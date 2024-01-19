"use client";

import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function MessengerAuth() {
  const searchParams = useSearchParams();

  const accountLinkingToken = searchParams.get("account_linking_token");
  const redirectURI = searchParams.get("redirect_uri");

  const { isSignedIn, user } = useUser();

  console.log(user, isSignedIn);

  return (
    <div>
      <h1>
        {accountLinkingToken}, {redirectURI}
      </h1>
    </div>
  );
}
