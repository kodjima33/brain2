import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-6/12 flex-col p-5 text-black">
      {children}
    </main>
  );
}
