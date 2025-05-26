import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/lib/api/client"; // Import the tRPC provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medical Protocol Assistant",
  description: "AI-assisted creation of standardized medical protocols.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
