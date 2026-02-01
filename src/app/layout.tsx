import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dimas & Davina Wedding",
  description: "We invite you to celebrate our special day - The Wedding of Dimas & Davina",
  keywords: ["wedding", "invitation", "Dimas", "Davina"],
  openGraph: {
    title: "Dimas & Davina Wedding",
    description: "We invite you to celebrate our special day",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
