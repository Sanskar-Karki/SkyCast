import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "SkyCast AI | Smart Weather Platform",
  description: "Next-gen weather dashboard with precision rain forecasting and Gemini-powered AI insights.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SkyCast AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#060c1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}
