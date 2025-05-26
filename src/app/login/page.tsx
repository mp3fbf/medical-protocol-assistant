/**
 * Login Page
 *
 * This page provides a form for users to sign in using their credentials.
 * It will interact with NextAuth for authentication.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Assistente de Protocolos Médicos",
  description: "Faça login para acessar o sistema.",
};

// TODO: Implement a proper login form component that uses NextAuth's signIn function.
// For now, this is a basic placeholder.

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-primary-700">
          Acessar Sistema
        </h1>
        <p className="mb-4 text-center text-gray-600">
          Implementação do formulário de login pendente.
        </p>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="seuemail@example.com"
              disabled
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="********"
              disabled
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            disabled
          >
            Entrar (Placeholder)
          </button>
        </div>
        {/* In a real form, you would handle submission with NextAuth's signIn method */}
        {/* e.g., onSubmit={(e) => { e.preventDefault(); signIn('credentials', { email, password, callbackUrl: '/dashboard' }); }} */}
      </div>
    </main>
  );
}
