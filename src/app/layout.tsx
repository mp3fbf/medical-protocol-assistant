import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "@/styles/ultra-design-system.css";
import { GlobalProviders } from "@/components/providers/global-providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medical Protocol Assistant",
  description: "AI-assisted creation of standardized medical protocols.",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MedProtocol",
  },
  icons: {
    icon: [
      { url: "/icons/icon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/icons/icon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/icon-96x96.svg", sizes: "96x96", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/icons/apple-icon-180x180.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://medical-protocol.vercel.app",
    title: "Medical Protocol Assistant",
    description:
      "Ferramenta web para criação assistida por IA de protocolos médicos padronizados",
    siteName: "Medical Protocol Assistant",
  },
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
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Pular para o conteúdo principal
        </a>
        <GlobalProviders session={session}>{children}</GlobalProviders>
      </body>
    </html>
  );
}
