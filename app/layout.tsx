import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Budget - Presupuesto Familiar",
  description: "Gestiona tu presupuesto familiar de manera inteligente con Home Budget",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Home Budget",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Home Budget",
    title: "Home Budget - Presupuesto Familiar",
    description: "Gestiona tu presupuesto familiar de manera inteligente con Home Budget",
  },
  twitter: {
    card: "summary",
    title: "Home Budget - Presupuesto Familiar",
    description: "Gestiona tu presupuesto familiar de manera inteligente con Home Budget",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Home Budget" />
        <link rel="apple-touch-icon" href="/logo-aplicativo/logo_esteban.png" />
        <link rel="icon" href="/logo-aplicativo/logo_esteban.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
