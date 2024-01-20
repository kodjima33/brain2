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
    <div>
      <h3>
        {authComplete
          ? "Your messenger account has been successfully linked! You're ready to start chatting with Brain² on Messenger :)"
          : "Loading..."}
      </h3>
    </div>
  );
}
