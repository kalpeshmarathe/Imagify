import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import { CursorGlow } from "@/components/CursorGlow";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imagify — Anonymous Image-Based Feedback",
  description: "Share honest feedback anonymously with images. No sign-up, no tracking. Just upload and send.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${nunito.variable} ${geistMono.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <AuthProvider>
          <CursorGlow />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
