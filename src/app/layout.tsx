import type { Metadata } from "next";
import Script from "next/script";
import { Nunito, Geist_Mono } from "next/font/google";
import { CursorGlow } from "@/components/CursorGlow";
import { AuthProvider } from "@/lib/auth-context";
import { LoadingProvider } from "@/lib/loading-context";
import { AuthRedirect } from "@/components/AuthRedirect";
import { ToastProvider } from "@/lib/toast-context";
import { GlobalLoader } from "@/components/GlobalLoader";
import { NotificationTitleUpdater } from "@/components/NotificationTitleUpdater";
import { AddToHomeScreenPrompt } from "@/components/AddToHomeScreenPrompt";
import { GlobalNotifications } from "@/components/GlobalNotifications";
import { AdSenseScript } from "@/components/AdSenseScript";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PicPop | The Pro Anonymous Image Feedback & Vibe Check Platform",
  description: "Get real, unfiltered anonymous feedback on your photos, designs, and vibe checks. PicPop offers secure one-way anonymity, real-time visual reactions, and a private feedback loop for creators, photographers, and influencers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  metadataBase: new URL("https://picpop.me"),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-ZNH6TJ4XQZ`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZNH6TJ4XQZ');`}
        </Script>
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vrhrengf1s");
          `}
        </Script>
        <AdSenseScript />
        <meta name="google-adsense-account" content="ca-pub-9913239924968431" />
      </head>
      <body
        className={`${nunito.variable} ${geistMono.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>
            <LoadingProvider>
              <NotificationTitleUpdater />
              <AuthRedirect />
              {children}
              <CursorGlow />
              <GlobalLoader />
              <AddToHomeScreenPrompt />
              <GlobalNotifications />
              <CookieConsent />
            </LoadingProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
