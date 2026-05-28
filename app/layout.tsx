import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Nav from "@/components/nav";
import PageTransition from "@/components/page-transition";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Gabriele Ucar — UX Technologist",
  description:
    "Portfolio of Gabriele Ucar, UX Technologist. Building interfaces with design and AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col">
          <Nav />
          <PageTransition>
            {children}
          </PageTransition>
        </body>
    </html>
  );
}
