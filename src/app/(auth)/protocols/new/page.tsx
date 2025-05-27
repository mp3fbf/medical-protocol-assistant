/**
 * New Protocol Page
 * Allows users to start creating a new medical protocol using a form.
 */
"use client"; // This page will use client-side hooks for form handling and API calls

import React from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next"; // Metadata can be defined, but won't be dynamic for client components
import {
  CreateProtocolForm,
  type CreateProtocolFormValues,
} from "@/components/protocol/forms/create-protocol-form";
import { trpc } from "@/lib/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// For client components, metadata is typically set in a parent layout or via document.title
// export const metadata: Metadata = {
//   title: "Novo Protocolo | Assistente de Protocolos Médicos",
//   description: "Inicie a criação de um novo protocolo médico.",
// };

export default function NewProtocolPage() {
  const router = useRouter();
  const createProtocolMutation = trpc.protocol.create.useMutation();

  const handleFormSubmit = async (data: CreateProtocolFormValues) => {
    try {
      const result = await createProtocolMutation.mutateAsync({
        title: data.title,
        condition: data.condition,
      });
      console.log("Protocol created (mock/actual):", result);
      // The `onSuccess` callback in the form component will handle success message
      // We handle redirection here.
      return { success: true, data: result };
    } catch (error: any) {
      console.error("Failed to create protocol:", error);
      return {
        success: false,
        error: error.message || "Falha ao enviar dados. Tente novamente.",
      };
    }
  };

  const handleSuccess = (createdProtocol?: any) => {
    if (createdProtocol?.id) {
      // After a short delay to show success message, redirect to the editor
      setTimeout(() => {
        router.push(`/protocols/${createdProtocol.id}`);
      }, 1500);
    } else {
      // Fallback if ID is not available, though it should be
      console.warn(
        "Protocol ID not found after creation, redirecting to list.",
      );
      setTimeout(() => {
        router.push(`/protocols`);
      }, 1500);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
          Iniciar Novo Protocolo Médico
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Preencha os detalhes iniciais para começar a desenvolver um novo
          protocolo padronizado.
        </p>
      </div>

      {createProtocolMutation.error && (
        // This top-level error display is for errors not caught by the form's own state.
        // The form itself has more specific error display.
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Criação</AlertTitle>
          <AlertDescription>
            {createProtocolMutation.error.message ||
              "Não foi possível criar o protocolo. Tente novamente."}
          </AlertDescription>
        </Alert>
      )}

      <CreateProtocolForm
        onSubmit={handleFormSubmit}
        onSuccess={handleSuccess}
      />

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Após a criação inicial, você será redirecionado para o editor completo
        para desenvolver as 13 seções do protocolo.
      </p>
    </div>
  );
}
