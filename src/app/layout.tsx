import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/lib/api/client"; // Import the tRPC provider
import SessionProviderWrapper from "@/components/providers/session-provider-wrapper"; // Import the new SessionProvider wrapper
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
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProviderWrapper session={session}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
