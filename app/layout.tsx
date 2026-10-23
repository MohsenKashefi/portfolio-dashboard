import type { Metadata } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const disp = Bodoni_Moda({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-disp" });

export const metadata: Metadata = {
  title: "Mohsen · Dashboard",
  description: "Private admin for mohsenkashefi.live",
  robots: { index: false, follow: false },
  icons: { icon: "https://mohsenkashefi.live/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${disp.variable}`}>
      <body>{children}</body>
    </html>
  );
}
