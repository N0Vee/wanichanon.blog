import React from "react";
import "./styles.css";

export const metadata = {
  title: {
    default: "Wanichanon.blog - Web Development & Programming Insights",
    template: "%s | Wanichanon.blog"
  },
  description: "Explore modern web development, React, TypeScript, and programming best practices. Join Wanichanon's journey through coding tutorials, tech insights, and developer resources.",
  keywords: [
    "web development",
    "React",
    "Next.js", 
    "TypeScript",
    "JavaScript",
    "CSS",
    "programming",
    "tutorials",
    "blog",
    "Wanichanon",
    "developer",
    "frontend",
    "backend",
    "full-stack"
  ],
  authors: [{ name: "Wanichanon", url: "https://wanichanon.blog" }],
  creator: "Wanichanon",
  publisher: "Wanichanon.blog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://wanichanon.blog"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Wanichanon.blog - Web Development & Programming Insights",
    description: "Explore modern web development, React, TypeScript, and programming best practices. Join Wanichanon's journey through coding tutorials, tech insights, and developer resources.",
    url: "https://wanichanon.blog",
    siteName: "Wanichanon.blog",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wanichanon.blog - Web Development & Programming Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wanichanon.blog - Web Development & Programming Insights",
    description: "Explore modern web development, React, TypeScript, and programming best practices.",
    creator: "@wanichanon",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  classification: "Blog",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
  applicationName: "Wanichanon.blog",
  verification: {
    // Add your verification codes here when you have them
    // google: "your-google-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default async function RootLayout(props) {
  const { children } = props;

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}