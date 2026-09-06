import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

import { DisclaimerBanner } from "@/components/layout/disclaimer_banner";
import "./globals.css";

/**
 * The closest freely licensed match to the reference setting.
 *
 * The reference is a commercially licensed display serif that cannot be
 * embedded here. Playfair Display carries the same high stroke contrast, fine
 * flat serifs and calligraphic italic, and is a variable font, so every weight
 * on the page costs one download rather than five.
 */
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
      className={`${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <DisclaimerBanner />
      </body>
    </html>
  );
}
