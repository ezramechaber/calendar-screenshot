import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from 'react';
import { CSPostHogProvider } from './providers';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "calshots",
  description: "monthview screenshot generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <CSPostHogProvider>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
      </CSPostHogProvider>
    </html>
  );
}
