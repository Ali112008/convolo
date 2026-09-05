import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Convolo — Conversation, unlocked.",
    short_name: "Convolo",
    description: "A private language-learning workspace for guided conversation and adaptive review.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f8f7fb",
    theme_color: "#6557e8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
