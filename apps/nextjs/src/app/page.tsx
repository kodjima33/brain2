"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInButton } from "@clerk/nextjs";

import GoogleImage from "~/../public/google.png";
import { Button } from "~/components/ui/button";
import Brain2Icon from "~/icons/Brain2Icon";

export default function HomePage() {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center text-black">
      <div className="mb-32 flex flex-col items-center">
        <Brain2Icon className="h-32" />
        <div className="mt-10 flex flex-col items-center">
          <p className="text-3xl font-bold">Brain²</p>
          <p className="text-xl">Your personalized AI journal</p>
        </div>
        <Button variant="outline" className="mt-10">
          <SignedOut>
            <div className="flex flex-row gap-3">
              <Image
                src={GoogleImage}
                alt="Google Logo"
                width={20}
                height={20}
              />
              <SignInButton afterSignInUrl="/app" />
            </div>
          </SignedOut>
          <SignedIn>
            <Link href="/app">Get Started</Link>
          </SignedIn>
        </Button>
      </div>
    </main>
  );
}
