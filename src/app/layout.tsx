import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Better Life",
  description: "Secure global healthcare records and temporary doctor access.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
