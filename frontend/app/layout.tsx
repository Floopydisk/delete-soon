import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ErrorBoundary } from "@/components/error-boundary";
import UserLayout from "@/components/layout/user-layout";
import { AuthProvider } from "@/components/providers/auth-provider";
// Import global styles
// @ts-ignore - CSS module import
import "./globals.css";

export const metadata: Metadata = {
  title: "Daystar Forms Portal",
  description:
    "Digital Forms Portal for Daystar Christian Centre, supporting Courtship, Burial, and Child Naming applications with administrative review workflows.",
  openGraph: {
    title: "Daystar Forms Portal",
    description:
      "Digital Forms Portal for Daystar Christian Centre, supporting Courtship, Burial, and Child Naming applications with administrative review workflows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <UserLayout>{children}</UserLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
