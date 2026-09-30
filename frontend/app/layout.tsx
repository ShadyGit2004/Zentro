import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";

import { ThemeProvider } from "@/providers/ThemeProvider";

import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zentro",
  description: "A modern social media platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Toaster position="top-right" />
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

