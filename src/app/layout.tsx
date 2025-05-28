import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "@/components/providers/global-providers"; // New
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medical Protocol Assistant",
  description: "AI-assisted creation of standardized medical protocols.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("[RootLayout DEBUG] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <GlobalProviders session={session}>{children}</GlobalProviders>
      </body>
    </html>
  );
}
