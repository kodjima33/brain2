import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";

import { env } from "~/env";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://brain2-psi.vercel.app"
      : "http://localhost:3000",
  ),
  title: "Brain²",
  description: "Your second brain",
  openGraph: {
    title: "Brain²",
    description: "Your second brain",
    url: "https://brain2-psi.vercel.app",
    siteName: "Brain²",
  },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={["font-sans", fontSans.variable].join(" ")}>
          {props.children}
        </body>
      </html>
    </ClerkProvider>
  );
}
