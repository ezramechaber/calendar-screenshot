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
  title: "calshot | calendar screenshot generator",
  description: "Create beautiful calendar screenshots for your project timelines and roadmaps. Drag and drop events, customize styles, export in seconds.",
  openGraph: {
    title: "calshot | calendar screenshot generator",
    description: "Create beautiful calendar screenshots for your project timelines and roadmaps",
    url: "https://calshot.xyz",
    siteName: "calshot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 778,
        alt: "calshot preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "calshot | calendar screenshot generator",
    description: "Create beautiful calendar screenshots for your project timelines and roadmaps",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://calshot.xyz"),  // Update with your actual domain
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
