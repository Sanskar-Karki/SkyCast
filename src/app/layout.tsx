import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingChat from "@/components/FloatingChat";
import Navbar from "@/components/Navbar";
import BackgroundGlow from "@/components/BackgroundGlow";

export const metadata: Metadata = {
// ...
// ... (omitting metadata for brevity, but it should stay)
// ...
};

// ...

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
      <body className="min-h-full flex flex-col bg-[#020617] text-white selection:bg-blue-500/30">
        <BackgroundGlow />
        {children}
        <Navbar />
        <FloatingChat />
      </body>
    </html>
  );
}
