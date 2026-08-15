import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Somnienne | Quiet Luxury Sleepwear",
  description: "Assemble your nights of sleep. Premium pajamas and sleepwear crafted for the quiet luxury lifestyle.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="antialiased">
        <SmoothScroll>
          <Loader />
          <Navbar /> {/* <--- ADD THIS */}
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}