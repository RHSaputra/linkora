import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { BackgroundEffects } from "@/components/layout/background-effects";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#090d16",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://linkorian.online"),
  title: {
    default: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
    template: "%s | Linkorian",
  },
  description:
    "Linkorian adalah platform cerdas AI bookmark manager dan link organizer untuk menyimpan, mengorganisasi, menganalisis URL, dan membangun personal knowledge base.",
  applicationName: "Linkorian",
  authors: [{ name: "Linkorian Team", url: "https://linkorian.online" }],
  generator: "Next.js",
  keywords: [
    "Linkorian",
    "bookmark manager",
    "AI bookmark manager",
    "link organizer",
    "save links",
    "link management",
    "organize bookmarks",
    "AI knowledge base",
    "URL analyzer",
    "link analysis tool",
    "save and organize links",
    "personal knowledge management",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://linkorian.online",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: "https://linkorian.online",
    siteName: "Linkorian",
    title: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
    description:
      "Simpan, kelola, analisis, dan manfaatkan kembali seluruh tautan & pengetahuan Anda secara cerdas bersama Linkorian.",
    images: [
      {
        url: "/icon.jpg",
        width: 1200,
        height: 630,
        alt: "Linkorian Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
    description:
      "Platform cerdas untuk menyimpan, mengorganisasi, menganalisis URL, dan membangun personal knowledge base.",
    images: ["/icon.jpg"],
    creator: "@linkorian",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased text-foreground bg-background overflow-x-hidden min-h-screen selection:bg-primary/30 selection:text-primary-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Providers>
            <BackgroundEffects />
            <div className="relative z-10 min-h-screen flex flex-col">
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
