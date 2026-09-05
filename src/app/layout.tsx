import type { Metadata } from "next";
import "./globals.css";
import { LearningProvider } from "@/components/learning-provider";
import { PwaController } from "@/components/pwa-controller";
import { WorkspacePreferencesController } from "@/components/workspace-preferences-controller";

export const metadata: Metadata = {
  title: {
    default: "Convolo — Conversation, unlocked.",
    template: "%s · Convolo",
  },
  description:
    "A local-first language-learning workspace for guided conversations, adaptive review, placement, and optional cloud sync.",
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
        <LearningProvider>
          <PwaController />
          <WorkspacePreferencesController />
          {children}
        </LearningProvider>
      </body>
    </html>
  );
}
