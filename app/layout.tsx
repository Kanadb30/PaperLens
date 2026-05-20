import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { GrainOverlay } from "@/components/GrainOverlay";
import { PageFoldTransition } from "@/components/PageFoldTransition";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const libre = Libre_Baskerville({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-libre-baskerville" });

export const metadata: Metadata = {
  title: "PaperLens",
  description: "AI research paper companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jetbrains.variable} ${libre.variable}`}>
      <body className="antialiased overflow-hidden w-full h-screen relative bg-[var(--bg-void)]">
        <GrainOverlay />
        <CustomCursor />
        <PageFoldTransition>
          {children}
        </PageFoldTransition>
      </body>
    </html>
  );
}
