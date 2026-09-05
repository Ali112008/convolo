import type { Metadata } from "next";
import "./globals.css";
import { LearningProvider } from "@/components/learning-provider";

export const metadata: Metadata = {
  title: {
    default: "Convolo — Conversation, unlocked.",
    template: "%s · Convolo",
  },
  description:
    "A local-first language-learning MVP for guided conversations, vocabulary review, and progress tracking.",
  applicationName: "Convolo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LearningProvider>{children}</LearningProvider>
      </body>
    </html>
  );
}
