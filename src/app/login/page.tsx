/**
 * Login Page - ULTRA DESIGN
 *
 * This page provides a premium form for users to sign in using their credentials.
 * It now interacts with NextAuth for authentication.
 */
"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { UltraGradientButton } from "@/components/ui/ultra-button";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import {
  Loader2,
  LogIn,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: _status } = useSession();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    if (_status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [_status, router, callbackUrl]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Credenciais inválidas. Verifique seu e-mail e senha."
            : `Ocorreu um erro ao tentar fazer login: ${result.error}`,
        );
        setIsLoading(false);
      } else if (result?.ok) {
        router.replace(callbackUrl);
      } else {
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

  if (_status === "loading" || _status === "authenticated") {
    return (
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-indigo-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20"
      >
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          <div className="absolute inset-0 animate-pulse bg-primary-500/20 blur-xl" />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {_status === "authenticated" ? "Redirecionando..." : "Carregando..."}
        </p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1' gradientTransform='rotate(45)'%3E%3Cstop offset='0' stop-color='%234f46e5' stop-opacity='0.05'/%3E%3Cstop offset='1' stop-color='%236366f1' stop-opacity='0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='1' fill='%234f46e5' opacity='0.1'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)'/%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 animate-[float_10s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-primary-400/20 to-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-[float_12s_ease-in-out_infinite_reverse] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div
        className={cn(
          "relative z-10 w-full max-w-md p-4 transition-all duration-1000",
          isPageLoaded
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0",
        )}
      >
        <UltraGlassCard className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 p-3 shadow-xl shadow-primary-500/25">
              <ShieldCheck className="h-full w-full text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-300">
              Acessar Plataforma
            </h1>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Sparkles className="h-4 w-4 text-primary-500" />
              Assistente de Protocolos Médicos
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className={cn(
                "mb-6 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-900/20",
                "transition-all duration-500",
                error
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                    Erro de Login
                  </h3>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full bg-white/50 px-4 py-3 pl-12 backdrop-blur-sm dark:bg-gray-800/50",
                    "rounded-xl border border-gray-200 dark:border-gray-700",
                    "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500",
                    "transition-all duration-300 placeholder:text-gray-400",
                  )}
                  placeholder="seuemail@example.com"
                />
                <LogIn className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full bg-white/50 px-4 py-3 pl-12 backdrop-blur-sm dark:bg-gray-800/50",
                    "rounded-xl border border-gray-200 dark:border-gray-700",
                    "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500",
                    "transition-all duration-300 placeholder:text-gray-400",
                  )}
                  placeholder="********"
                />
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <UltraGradientButton
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
              icon={
                isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )
              }
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </UltraGradientButton>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span>Sistema seguro</span>
              </div>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span>Criptografia ativa</span>
              </div>
            </div>
          </div>
        </UltraGlassCard>

        <p
          className={cn(
            "mt-6 text-center text-xs text-gray-500 transition-all delay-200 duration-1000 dark:text-gray-400",
            isPageLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0",
          )}
        >
          Lembre-se: esta página de login está usando autenticação simulada para
          desenvolvimento.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-indigo-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            <div className="absolute inset-0 animate-pulse bg-primary-500/20 blur-xl" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
