"use-client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Brain2Icon from "~/icons/Brain2Icon";

interface Props {
  user: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  title?: string;
}

export default function Header({ user, title }: Props) {
  return (
    <header className="flex w-8/12 flex-row justify-between">
      <div className="flex flex-row items-center gap-10">
        <Link href="/app">
          <Brain2Icon className="h-12 w-12 cursor-pointer" />
        </Link>
        {title ? <p className="text-2xl font-semibold">{title}</p> : null}
      </div>
      <Link href="/app/settings">
        <Avatar className="cursor-pointer rounded-full border border-gray-400">
          <AvatarImage src={user.imageUrl ?? ""} />
          <AvatarFallback>
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
