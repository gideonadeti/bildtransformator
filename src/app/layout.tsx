import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "./components/auth-provider";
import Footer from "./components/footer";
import Header from "./components/header";
import QcProvider from "./components/qc-provider";
import ThemeProvider from "./components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bildtransformator",
  description:
    "A service similar to Cloudinary that allows users to upload images, apply transformations, and view or download the results.",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QcProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster richColors />
            </ThemeProvider>
          </AuthProvider>
        </QcProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default Layout;
