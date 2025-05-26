/**
 * Authentication Error Page
 *
 * This page is displayed when an authentication error occurs,
 * such as invalid credentials or other sign-in issues.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erro de Autenticação | Assistente de Protocolos Médicos",
};

export default function AuthErrorPage() {
  // You can use searchParams to get error details if NextAuth provides them
  // For example:
  // const searchParams = useSearchParams();
  // const error = searchParams.get('error');
  // let errorMessage = "Ocorreu um erro durante a autenticação.";
  // if (error === "CredentialsSignin") {
  //   errorMessage = "Credenciais inválidas. Por favor, verifique seu email e senha.";
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-2xl font-semibold text-danger">
          Erro de Autenticação
        </h1>
        <p className="mb-6 text-gray-600">
          Não foi possível realizar o login. Verifique suas credenciais ou tente
          novamente mais tarde.
          {/* You can display more specific error messages here based on `error` query param */}
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-primary-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Tentar Novamente
        </Link>
      </div>
    </main>
  );
}
