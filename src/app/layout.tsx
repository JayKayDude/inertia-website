import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inertia — Smooth Scrolling for Every Mouse on Mac",
  description:
    "Inertia replaces choppy mouse wheel scrolling on macOS with fluid, physics-based momentum. Free, open source, and under 2 MB.",
  openGraph: {
    title: "Inertia — Smooth Scrolling for Every Mouse on Mac",
    description:
      "Physics-based inertial scrolling that makes any mouse feel as smooth as a trackpad. 100% free and open source.",
    type: "website",
    url: "https://inertia-website.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inertia — Smooth Scrolling for Every Mouse",
    description:
      "Physics-based inertial scrolling for macOS. Free and open source.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme');
                  if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
