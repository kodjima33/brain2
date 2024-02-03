"use client";

import { useUser } from "@clerk/nextjs";

import Header from "~/components/header";

export default function SettingsPage() {
  const { user } = useUser();
  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} title="Settings" />
    </>
  );
}
