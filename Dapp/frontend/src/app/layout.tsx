import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppKit } from "@/context/appkit";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroTwin DApp - Ứng dụng nông nghiệp thông minh",
  description: "Giúp nông dân theo dõi và tin tưởng vào dữ liệu môi trường thật sự thông qua IoT, AI và Blockchain (Zero Network)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppKit>
            {children}
          </AppKit>
        </AuthProvider>
      </body>
    </html>
  );
}
