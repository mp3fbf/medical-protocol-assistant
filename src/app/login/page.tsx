/**
 * Login Page
 *
 * This page provides a form for users to sign in using their credentials.
 * It now interacts with NextAuth for authentication.
 */
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Metadata } from "next"; // Note: Metadata in client components is tricky
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, LogIn, AlertTriangle } from "lucide-react";

// Metadata for client components should ideally be handled by parent server components/layouts
// export const metadata: Metadata = {
//   title: "Login | Assistente de Protocolos Médicos",
//   description: "Faça login para acessar o sistema.",
// };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is already authenticated, redirect them from login page
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log("[LOGIN PAGE DEBUG] Attempting signIn with:", {
      email,
      callbackUrl,
    });

    try {
      const result = await signIn("credentials", {
        redirect: false, // Handle redirect manually
        email,
        password,
        callbackUrl, // NextAuth will use this if redirect was true
      });

      console.log("[LOGIN PAGE DEBUG] signIn result:", result); // Log the full result

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Credenciais inválidas. Verifique seu e-mail e senha."
            : `Ocorreu um erro ao tentar fazer login: ${result.error}`, // Show more specific error if available
        );
        setIsLoading(false);
      } else if (result?.ok) {
        // Successful sign-in, router.replace will be handled by the useEffect or NextAuth's default behavior if redirect wasn't false
        // For clarity with redirect:false, we explicitly push.
        console.log(
          "[LOGIN PAGE DEBUG] signIn successful, redirecting to:",
          callbackUrl,
        );
        router.replace(callbackUrl);
      } else {
        // Should not happen if result.error is not set and result.ok is not true
        setError(
          "Falha no login por um motivo desconhecido. Verifique o console do servidor.",
        );
        setIsLoading(false);
      }
    } catch (e) {
      console.error("[LOGIN PAGE DEBUG] Exception during signIn:", e);
      setError("Ocorreu uma exceção durante o login. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    // Show loading indicator or let useEffect redirect if authenticated
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {status === "authenticated" ? "Redirecionando..." : "Carregando..."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50 p-4 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div className="mb-8 text-center">
          <LogIn className="dark:text-primary-400 mx-auto mb-3 h-12 w-12 text-primary-500" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
            Acessar Plataforma
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Assistente de Protocolos Médicos
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro de Login</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="seuemail@example.com"
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="********"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Lembre-se: esta página de login está usando autenticação simulada para
          desenvolvimento.
        </p>
      </div>
    </main>
  );
}
