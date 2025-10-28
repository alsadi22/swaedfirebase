import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SwaedUAE - UAE Premier Volunteer Management Platform",
  description: "Connect with verified organizations, track volunteer hours, and make a difference across the UAE",
  keywords: "volunteer, UAE, Dubai, community service, volunteering, charity, NGO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <UserProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
