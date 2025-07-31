/**
 * New Protocol Page - ULTRA DESIGN
 * Allows users to start creating a new medical protocol using a form with premium UI.
 */
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { CreateProtocolFormValues } from "@/components/protocol/forms/create-protocol-form-ultra";
import { trpc } from "@/lib/api/client";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import { AlertCircle, Sparkles, ArrowLeft } from "lucide-react";
import { UltraButton } from "@/components/ui/ultra-button";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the heavy form component to avoid chunk loading issues
const CreateProtocolForm = dynamic(
  () =>
    import("@/components/protocol/forms/create-protocol-form-ultra").then(
      (mod) => ({ default: mod.CreateProtocolFormUltra }),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    ),
  },
);

export default function NewProtocolPage() {
  const router = useRouter();
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);
  const createProtocolMutation = trpc.protocol.create.useMutation({
    // Optional: onSuccess and onError directly on useMutation can also be used
    // but we are handling it via the promise returned by mutateAsync for now.
  });

  const startGenerationMutation = trpc.generation.startGeneration.useMutation();

  const triggerMutation = async (data: CreateProtocolFormValues) => {
    console.log("[NewProtocolPage] triggerMutation called with data:", data);
    if (!data || !data.title || !data.condition) {
      console.error(
        "[NewProtocolPage] triggerMutation: Invalid data received:",
        data,
      );
      return {
        success: false,
        error: "Dados do formulário inválidos ou ausentes para mutação.",
        data: null,
      };
    }
    try {
      console.log(
        "[NewProtocolPage] Calling createProtocolMutation.mutateAsync with enhanced data:",
        data,
      );

      // Convert File objects to base64 if material files are present
      let materialFilesData = undefined;
      if (data.materialFiles && data.materialFiles.length > 0) {
        console.log("[NewProtocolPage] Converting material files to base64...");
        materialFilesData = await Promise.all(
          data.materialFiles.map(async (file) => {
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            return {
              name: file.name,
              buffer: base64,
              type: file.type,
              size: file.size,
            };
          }),
        );
        console.log(
          "[NewProtocolPage] Converted files:",
          materialFilesData.map((f) => f.name),
        );
      }

      // Pass all form data including the new fields
      const result = await createProtocolMutation.mutateAsync({
        title: data.title,
        condition: data.condition,
        generationMode: data.generationMode,
        context: data.context,
        targetPopulation: data.targetPopulation,
        researchSources: data.researchSources,
        yearRange: data.yearRange,
        materialFiles: materialFilesData,
        supplementWithResearch: data.supplementWithResearch,
      });
      console.log(
        "[NewProtocolPage] Protocol mutation successful, result data:",
        result,
      );

      // For automatic or material_based modes, start generation immediately
      if (data.generationMode !== "manual") {
        console.log(
          "[NewProtocolPage] Starting automatic generation for protocol:",
          result.id,
        );

        // Don't wait for generation to complete - it will happen in background
        startGenerationMutation.mutate({
          protocolId: result.id,
        });
      }

      return { success: true, data: result, error: undefined };
    } catch (error: any) {
      console.error(
        "[NewProtocolPage] createProtocolMutation.mutateAsync failed:",
        error,
      );
      let errorMessage = "Falha ao criar protocolo.";
      if (error.message) {
        errorMessage = error.message;
      }
      if (
        error.data &&
        error.data.zodError &&
        error.data.zodError.fieldErrors
      ) {
        // More specific Zod error
        const fieldErrors = Object.entries(error.data.zodError.fieldErrors)
          .map(
            ([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`,
          )
          .join("; ");
        errorMessage = `Erro de validação: ${fieldErrors}`;
      } else if (error.data?.httpStatus) {
        console.error(
          "[NewProtocolPage] tRPC Error details:",
          JSON.stringify(error.data, null, 2),
        );
        errorMessage = `Erro no servidor (HTTP ${error.data.httpStatus}): ${error.message}`;
      }
      return {
        success: false,
        error: errorMessage,
        data: null,
      };
    }
  };

  const handleFormSubmit = (
    data: CreateProtocolFormValues,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    console.log(
      "[NewProtocolPage] handleFormSubmit (passed to form) received data:",
      data,
    );
    return triggerMutation(data);
  };

  const handleSuccess = (createdProtocol?: any) => {
    console.log(
      "[NewProtocolPage] handleSuccess called with createdProtocol:",
      createdProtocol,
    );
    if (
      createdProtocol &&
      createdProtocol.id &&
      typeof createdProtocol.id === "string"
    ) {
      console.log(
        `[NewProtocolPage] Navigating to /protocols/${createdProtocol.id}`,
      );
      // Navigate immediately for better test reliability
      router.push(`/protocols/${createdProtocol.id}`);
    } else {
      console.warn(
        "[NewProtocolPage] Protocol ID not found or invalid after creation attempt. Not redirecting.",
        "Received createdProtocol:",
        createdProtocol,
      );
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1' gradientTransform='rotate(45)'%3E%3Cstop offset='0' stop-color='%234f46e5' stop-opacity='0.02'/%3E%3Cstop offset='1' stop-color='%236366f1' stop-opacity='0.02'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='1' fill='%234f46e5' opacity='0.1'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)'/%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <div
          className={`transition-all duration-700 ${isPageLoaded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
        >
          <UltraButton
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.back()}
          >
            Voltar
          </UltraButton>
        </div>

        {/* Hero Section */}
        <div
          className={`text-center transition-all duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary-500" />
            <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-lg font-medium text-transparent">
              Assistente IA Médico
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-gray-300">
            Criar Novo Protocolo Médico
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Configure a pesquisa médica e o modo de geração para criar um
            protocolo baseado em evidências científicas
          </p>
        </div>

        {/* Error Alert */}
        {createProtocolMutation.isError && (
          <div
            className={`transition-all duration-700 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <UltraGlassCard className="border-red-200 bg-red-50/50 p-6 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Erro na Criação
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {createProtocolMutation.error?.message ||
                      "Não foi possível criar o protocolo. Tente novamente."}
                  </p>
                </div>
              </div>
            </UltraGlassCard>
          </div>
        )}

        {/* Form Container */}
        <div
          className={`transition-all delay-200 duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <UltraGlassCard className="p-8">
            <CreateProtocolForm
              onSubmit={handleFormSubmit}
              onSuccess={handleSuccess}
            />
          </UltraGlassCard>
        </div>

        {/* Footer Info */}
        <div
          className={`text-center transition-all delay-300 duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Após a configuração inicial, você será redirecionado para o editor
            completo onde poderá desenvolver as 13 seções obrigatórias do
            protocolo médico.
          </p>
        </div>
      </div>
    </div>
  );
}
