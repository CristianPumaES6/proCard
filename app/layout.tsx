import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import Providers from "@/components/providers/session-provider";
import { CursorFX } from "@/components/effects/CursorFX";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Cristian Puma | Senior Software Architect",
  description: "Expert OutSystems & Full Stack Developer. Specialized in scalable, mission-critical systems.",
  keywords: ["OutSystems", "Full Stack", "Software Architect", "Enterprise Systems"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          {/* Efecto de cursor global (aurora) — cambia por módulo via <CursorVariant /> */}
          <CursorFX />

          {/* Subtle animated background */}
          <div className="fixed inset-0 bg-grid-pattern-subtle pointer-events-none z-0 opacity-50 print:hidden" />
          <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none z-0 print:hidden" />

          <div className="relative z-10 flex flex-col min-h-screen">
            <div className="print:hidden">
              <Navbar />
            </div>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
