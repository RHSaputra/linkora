import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://linkorian.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/features/",
          "/guides/",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/links",
          "/notes",
          "/collections",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
