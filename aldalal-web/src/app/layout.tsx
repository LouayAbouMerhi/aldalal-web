import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { AppChrome } from "@/components/AppChrome";
import { site } from "@/config/site";
import "./globals.css";

// Editorial serif for headings. The two .woff2 files live in src/fonts/, so the
// site needs no font download and no extra dependency.
const display = localFont({
  src: [
    {
      path: "../fonts/playfair-display-latin.woff2",
      style: "normal",
      weight: "400 900",
    },
    {
      path: "../fonts/playfair-display-latin-italic.woff2",
      style: "italic",
      weight: "400 900",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to your domain so link previews use absolute URLs
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${site.fullName} | Price List`,
  description: site.description,
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-touch-icon.png" },
  openGraph: {
    title: `${site.fullName} | Price List`,
    description: site.description,
    images: [{ url: "/logo.png", width: 225, height: 224, alt: site.fullName }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script below adds a "js" class before React hydrates
    <html lang="en" className={`${GeistSans.variable} ${display.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        {/* Marks that JavaScript is running, so the scroll-reveal CSS never hides content on its own */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
