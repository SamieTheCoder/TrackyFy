import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import CustomLayout from "@/custom-layout";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';


export const metadata: Metadata = {
  title: "TrackyFy",
  description: "Gym Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="48x48"></link>
          <link
            rel="icon"
            href="/favicon.svg"
            sizes="any"
            type="image/svg+xml"
          ></link>
        </head>

        <body>
          <CustomLayout>{children}</CustomLayout>
          <SpeedInsights />
          <Analytics />
          <Toaster position="top-center" reverseOrder={false} />
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
