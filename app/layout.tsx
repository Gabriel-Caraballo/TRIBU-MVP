// app/layout.tsx
// Layout principal de la aplicación

import "./globals.css";
import { Inter, Lora } from "next/font/google";

// Cargar la fuente Inter para cuerpo de texto
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Cargar la fuente Lora para títulos
const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable} scroll-smooth dark`}>
      <body className="min-h-screen font-mono bg-[#0a0a09] text-[#e8e8e2] antialiased selection:bg-[--tribu-green] selection:text-[#0a0a09]">
        {children}
      </body>
    </html>
  );
}