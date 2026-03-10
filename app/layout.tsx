import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/app/providers";
import { clerkAppearance } from "@/lib/clerk-theme";
import "./globals.css";

const GA_ID = "G-5TPJEHGQ1M";

export const metadata: Metadata = {
  title: {
    default: "mydscvr Eats - Restaurant Menu Pages for Dubai",
    template: "%s",
  },
  description:
    "Beautiful hosted menu pages for Dubai restaurants. Browse menus with dish photos, prices, and descriptions.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mydscvr.ai"),
  openGraph: {
    siteName: "mydscvr Eats",
    locale: "en_AE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );

  const content = (
    <html lang="en">
      <body className="font-sans antialiased">
        {analytics}
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
          {analytics}
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
