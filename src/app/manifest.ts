import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
    short_name: "Linkorian",
    description: "Platform cerdas untuk menyimpan, mengelola, menganalisis, dan memanfaatkan kembali tautan & pengetahuan Anda.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#090d16",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
