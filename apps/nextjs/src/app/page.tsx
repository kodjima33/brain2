import { auth, currentUser, SignedIn } from "@clerk/nextjs";

import ClipboardButton from "~/components/clipboard-button";

export default async function HomePage() {
  const { getToken } = auth();
  const token = await getToken();
  const user = await currentUser();

  return (
    <main className="flex h-screen flex-col items-center text-black">
      <div className="container mt-36 flex flex-col items-center justify-center gap-4 py-8">
        <SignedIn>
          <h1 className="text-3xl font-bold tracking-tight sm:text-[5rem]">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <div className="mt-10 flex flex-row gap-5 items-center justify-center">
            <span className="text-lg">Click to copy your Clerk JWT:</span>
            <ClipboardButton text={token!} />
          </div>
        </SignedIn>
      </div>
    </main>
  );
}
