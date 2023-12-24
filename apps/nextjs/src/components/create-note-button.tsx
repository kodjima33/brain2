"use client";

export default function CreateNoteButton({
  createFunction,
}: {
  createFunction: () => Promise<void>;
}) {
  return (
    <button
      className="rounded-2xl border border-black bg-white px-4 py-2 text-black"
      onClick={() => {
        void createFunction();
      }}
    >
      Create note
    </button>
  );
}
