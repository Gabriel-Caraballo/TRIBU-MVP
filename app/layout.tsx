// app/layout.tsx
// Layout principal de la aplicación

import "./globals.css";
import { Inter } from "next/font/google";

// Cargar la fuente Inter
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}