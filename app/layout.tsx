import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";

export const metadata: Metadata = {
  title: {
    default: "OmniRoute — Every AI tool → 352 providers through one endpoint",
    template: "%s · OmniRoute",
  },
  description:
    "OmniRoute is a universal, open-source AI gateway: one OpenAI-compatible API for Claude, GPT, Gemini, DeepSeek and 352+ providers with routing, token compression, and a live dashboard.",
  keywords: [
    "AI gateway", "LLM router", "OpenAI compatible", "Claude Code", "Cursor", "token compression",
    "DeepSeek", "Gemini", "GPT", "open source",
  ],
  metadataBase: new URL("https://omniroute.dev"),
  openGraph: {
    title: "OmniRoute",
    description: "Never stop coding. Every AI tool → 352 providers — 150+ free — through one endpoint.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
