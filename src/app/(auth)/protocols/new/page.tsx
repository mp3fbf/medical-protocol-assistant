/**
 * New Protocol Page
 * Allows users to start creating a new medical protocol using a form.
 */
"use client"; 

import React from "react";
import { useRouter } from "next/navigation";
import {
  CreateProtocolForm,
  type CreateProtocolFormValues,
} from "@/components/protocol/forms/create-protocol-form";
import { trpc } from "@/lib/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


export default function NewProtocolPage() {
  const router = useRouter();
  const createProtocolMutation = trpc.protocol.create.useMutation({
    // Optional: onSuccess and onError directly on useMutation can also be used
    // but we are handling it via the promise returned by mutateAsync for now.
  });

  const triggerMutation = async (data: CreateProtocolFormValues) => {
    console.log('[NewProtocolPage] triggerMutation called with data:', data);
    if (!data || !data.title || !data.condition) {
      console.error("[NewProtocolPage] triggerMutation: Invalid data received:", data);
      return {
        success: false,
        error: "Dados do formulário inválidos ou ausentes para mutação.",
        data: null,
      };
    }
    try {
      console.log('[NewProtocolPage] Calling createProtocolMutation.mutateAsync with:', { title: data.title, condition: data.condition });
      // Ensure we are passing exactly what the Zod schema CreateProtocolInputSchema expects
      const result = await createProtocolMutation.mutateAsync({
        title: data.title,
        condition: data.condition,
      });
      console.log("[NewProtocolPage] Protocol mutation successful, result data:", result);
      return { success: true, data: result, error: undefined };
    } catch (error: any) {
      console.error("[NewProtocolPage] createProtocolMutation.mutateAsync failed:", error);
      let errorMessage = "Falha ao criar protocolo.";
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.data && error.data.zodError && error.data.zodError.fieldErrors) {
        // More specific Zod error
        const fieldErrors = Object.entries(error.data.zodError.fieldErrors)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`)
          .join("; ");
        errorMessage = `Erro de validação: ${fieldErrors}`;
      } else if (error.data?.httpStatus) {
         console.error("[NewProtocolPage] tRPC Error details:", JSON.stringify(error.data, null, 2));
         errorMessage = `Erro no servidor (HTTP ${error.data.httpStatus}): ${error.message}`;
      }
      return {
        success: false,
        error: errorMessage,
        data: null,
      };
    }
  };
  
  const handleFormSubmit = (data: CreateProtocolFormValues): Promise<{ success: boolean; data?: any; error?: string }> => {
    console.log('[NewProtocolPage] handleFormSubmit (passed to form) received data:', data);
    return triggerMutation(data);
  };

  const handleSuccess = (createdProtocol?: any) => {
    console.log('[NewProtocolPage] handleSuccess called with createdProtocol:', createdProtocol);
    if (createdProtocol && createdProtocol.id && typeof createdProtocol.id === 'string') {
      console.log(`[NewProtocolPage] Navigating to /protocols/${createdProtocol.id}`);
      // Navigate immediately for better test reliability
      router.push(`/protocols/${createdProtocol.id}`);
    } else {
      console.warn(
        "[NewProtocolPage] Protocol ID not found or invalid after creation attempt. Not redirecting.",
        "Received createdProtocol:", createdProtocol
      );
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

      {createProtocolMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Criação (Mutation Hook)</AlertTitle>
          <AlertDescription>
            {createProtocolMutation.error?.message ||
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