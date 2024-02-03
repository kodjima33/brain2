"use server";

import { currentUser } from "@clerk/nextjs";

import { prisma } from "@brain2/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Brain2Icon from "~/icons/Brain2Icon";

export default async function AppPage() {
  const user = await currentUser();
  if (user == null) {
    return <div>Loading...</div>;
  }

  const notes = await prisma.note.findMany({
    where: {
      owner: user.id,
    },
  });

  return (
    <main className="flex h-screen w-screen flex-col p-5">
      <header className="flex flex-row justify-between">
        <Brain2Icon className="h-12 w-12" />
        <Avatar className="border border-gray-400 rounded-full">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </header>
    </main>
  );
}
