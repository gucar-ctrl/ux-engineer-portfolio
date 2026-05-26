import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Nav from "@/components/nav";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Gabriele Ucar — UX Engineer",
  description: "Portfolio di Gabriele Ucar, UX Engineer e Design Technologist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col">
          <Nav />
          {children}
        </body>
    </html>
  );
}
