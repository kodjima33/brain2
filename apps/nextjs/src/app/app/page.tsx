"use server";

import { currentUser } from "@clerk/nextjs";

import { prisma } from "@brain2/db";

import { NoteView } from "~/components/note";
import Header from "~/components/header";

export default async function AppPage() {
  const user = await currentUser();
  if (user == null) {
    return <div>Loading...</div>;
  }

  const notes = await prisma.note.findMany({
    where: {
      owner: user.id,
      active: true,
    },
    include: {
      revision: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      {user ? <Header user={user} /> : null}
      <NoteView notes={notes} className="w-8/12" />
    </>
  );
}
