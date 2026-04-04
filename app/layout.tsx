import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Ravonak",
  description: "Авторизация администратора",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}
