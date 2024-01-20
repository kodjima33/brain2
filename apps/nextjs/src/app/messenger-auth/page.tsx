"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

interface LinkRequest {
  messengerPSID: string;
}

export default function MessengerAuth() {
  const searchParams = useSearchParams();

  const messengerPSID = searchParams.get("messengerPSID");

  const { isSignedIn, getToken } = useAuth();

  const [authComplete, setAuthComplete] = useState(false);

  async function linkMessengerAccount() {
    if (!messengerPSID) {
      return;
    }

    const token = await getToken();

    const request: LinkRequest = { messengerPSID: messengerPSID };

    await axios.post("/api/conversations/messenger-auth", request, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setAuthComplete(true);
  }

  useEffect(() => {
    if (isSignedIn) {
      void linkMessengerAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);
  return (
    <main className="flex h-screen flex-col items-center text-black">
      <div className="container mt-36 flex flex-col items-center justify-center gap-4 py-8">
        <h3 className="text-3xl font-bold tracking-tight sm:text-[5rem]">
          {authComplete
            ? "Your messenger account has been successfully linked! You're ready to start chatting with Brain² on Messenger :)"
            : "Loading..."}
        </h3>
      </div>
    </main>
  );
}
