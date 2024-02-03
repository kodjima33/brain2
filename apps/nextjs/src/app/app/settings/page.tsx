/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOutIcon } from "lucide-react";

import Header from "~/components/header";
import { cn } from "~/lib/utils";

interface SettingsEntryProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  className?: string;
}

function SettingsEntry({ icon, text, onClick, className }: SettingsEntryProps) {
  return (
    <div
      className={cn(
        className,
        "flex cursor-pointer flex-row items-center gap-5 p-2",
      )}
      onClick={onClick}
    >
      {icon}
      <p className="font-semibold">{text}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} title="Settings" />
      <div className="flex w-8/12 flex-col items-start gap-2">
        <p className="font-bold">Account</p>
        <SettingsEntry
          icon={<LogOutIcon />}
          text="Sign out"
          className="text-red-500"
          onClick={signOut}
        />
      </div>
    </>
  );
}
