import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";

const sans = Geist({ subsets: ["latin"] });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "FixSEO - CLI & OpenCode Tool for SEO analysis",
  description:
    "Scan websites for SEO issues from the CLI or use as an OpenCode tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.className} ${mono.variable} min-h-screen bg-background text-foreground antialiased font-mono`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
