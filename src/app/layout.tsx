import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectOS - Multi-Project, Auto-API & 360° Observability Platform",
  description: "Next-generation cloud platform for project management, auto-generated REST APIs, and 360-degree monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-cyber-darker text-slate-100 min-h-screen antialiased selection:bg-cyber-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
