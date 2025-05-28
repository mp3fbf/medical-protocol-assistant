/**
 * CreateProtocolForm component
 * A form for initiating the creation of a new medical protocol.
 */
"use client";

import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const createProtocolFormSchema = z.object({
  title: z
    .string()
    .min(5, "O título deve ter pelo menos 5 caracteres.")
    .max(200, "O título não pode exceder 200 caracteres."),
  condition: z
    .string()
    .min(3, "A condição médica principal deve ter pelo menos 3 caracteres.")
    .max(150, "A condição médica não pode exceder 150 caracteres."),
});

export type CreateProtocolFormValues = z.infer<typeof createProtocolFormSchema>;

interface CreateProtocolFormProps {
  onSubmit: (
    data: CreateProtocolFormValues,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  onSuccess?: (data?: any) => void; 
}

export const CreateProtocolForm: React.FC<CreateProtocolFormProps> = ({
  onSubmit,
  onSuccess,
}) => {
  const [formStatus, setFormStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProtocolFormValues>({
    resolver: zodResolver(createProtocolFormSchema),
  });

  const processSubmit: SubmitHandler<CreateProtocolFormValues> = async (
    data,
  ) => {
    // DEBUG: Log data collected by react-hook-form
    console.log('[CreateProtocolForm] Data from react-hook-form:', data);
    
    setFormStatus("loading");
    setFormError(null);
    try {
      const result = await onSubmit(data); // This calls handleFormSubmit in NewProtocolPage
      if (result.success) {
        setFormStatus("success");
        if (onSuccess) onSuccess(result.data);
        reset(); 
      } else {
        setFormStatus("error");
        setFormError(result.error || "Ocorreu um erro desconhecido.");
      }
    } catch (error) {
      setFormStatus("error");
      setFormError(
        error instanceof Error ? error.message : "Falha ao criar protocolo.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div>
        <Label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Título do Protocolo
        </Label>
        <Input
          id="title"
          type="text"
          {...register("title")}
          className={errors.title ? "border-red-500" : ""}
          aria-invalid={errors.title ? "true" : "false"}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label
          htmlFor="condition"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Condição Médica Principal
        </Label>
        <Input
          id="condition"
          type="text"
          {...register("condition")}
          className={errors.condition ? "border-red-500" : ""}
          aria-invalid={errors.condition ? "true" : "false"}
        />
        {errors.condition && (
          <p className="mt-1 text-xs text-red-600">
            {errors.condition.message}
          </p>
        )}
      </div>

      {formStatus === "error" && formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro!</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {formStatus === "success" && (
        <Alert
          variant="default"
          className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30"
        >
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-700 dark:text-green-300">
            Sucesso!
          </AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            Protocolo iniciado. Você será redirecionado.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={formStatus === "loading"}
        className="w-full sm:w-auto"
      >
        {formStatus === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          "Iniciar Criação do Protocolo"
        )}
      </Button>
    </form>
  );
};