import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  title: "VentureWise",
  description:
    "A behavioural interview coach for international students job-hunting in Australia. Not migration advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist_sans.variable} ${geist_mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <DisclaimerBanner />
      </body>
    </html>
  );
}
