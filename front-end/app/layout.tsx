import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google";

import { DisclaimerBanner } from "@/components/layout/disclaimer_banner";
import "./globals.css";

const geist_sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geist_mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The stand-in for Edwardian Script ITC.
 *
 * Edwardian Script ITC is a Monotype font. It ships with Microsoft Office, so
 * it is on most Windows machines, but it is not licensed for embedding and is
 * not on Google Fonts — serving the file would be a licensing breach. So the
 * display stack names it first, unembedded: anyone who has it locally sees the
 * real thing, and everyone else gets Great Vibes, the closest freely licensed
 * formal script.
 */
const great_vibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "VentureWise",
  description:
    "A behavioural interview coach for international students job-hunting in Australia. Not migration advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist_sans.variable} ${geist_mono.variable} ${great_vibes.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <DisclaimerBanner />
      </body>
    </html>
  );
}
