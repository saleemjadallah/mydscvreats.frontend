import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/app/providers";
import { clerkAppearance } from "@/lib/clerk-theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "mydscvr Eats",
  description:
    "AI-powered living menu pages for Dubai restaurants, with hosted menus, dish imagery, and subscription billing.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mydscvr.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return content;
  }

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <body className="font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
