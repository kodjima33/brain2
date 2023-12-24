import { generateId, prisma } from "@brain2/db";

import CreateNoteButton from "~/components/create-note-button";

async function createNote() {
  "use server";
  
  await prisma.note.create({
    data: {
      id: generateId("note"),
      owner: "",
      content: "Hello world!",
      digestSpan: "SINGLE",
    },
  });
}

export default async function HomePage() {
  const notes = await prisma.note.findMany();

  return (
    <main className="flex h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mt-12 flex flex-col items-center justify-center gap-4 py-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Create <span className="text-pink-400">T3</span> Turbo
        </h1>
        <p>There are {notes.length} notes</p>
        <CreateNoteButton createFunction={createNote} />
      </div>
    </main>
  );
}
