import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import AuthProvider from "./components/auth-provider";
import QcProvider from "./components/qc-provider";

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
          <AuthProvider>{children}</AuthProvider>
        </QcProvider>
      </body>
    </html>
  );
};

export default Layout;
