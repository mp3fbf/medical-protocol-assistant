/**
 * CreateProtocolForm component
 * A form for initiating the creation of a new medical protocol with AI research.
 */
"use client";

import React, { useState, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  FileText,
  Zap,
  Upload,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

// Enhanced schema with generation mode, research options, and material upload
const createProtocolFormSchema = z.object({
  title: z
    .string()
    .min(5, "O título deve ter pelo menos 5 caracteres.")
    .max(200, "O título não pode exceder 200 caracteres."),
  condition: z
    .string()
    .min(3, "A condição médica principal deve ter pelo menos 3 caracteres.")
    .max(150, "A condição médica não pode exceder 150 caracteres."),
  generationMode: z.enum(["automatic", "manual", "material_based"], {
    required_error: "Selecione um modo de geração.",
  }),
  targetPopulation: z
    .string()
    .min(2, "A população alvo deve ter pelo menos 2 caracteres.")
    .max(100, "A população alvo não pode exceder 100 caracteres.")
    .optional(),
  researchSources: z
    .array(z.enum(["pubmed", "scielo", "cfm", "mec"]))
    .min(1, "Selecione pelo menos uma fonte de pesquisa.")
    .optional(),
  yearRange: z.number().min(1).max(10).default(5).optional(),
  materialFiles: z.array(z.any()).optional(), // Files will be handled separately
  supplementWithResearch: z.boolean().default(false).optional(),
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
    "idle" | "researching" | "loading" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [researchProgress, setResearchProgress] = useState<string>("");
  const [_uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateProtocolFormValues>({
    resolver: zodResolver(createProtocolFormSchema),
    defaultValues: {
      generationMode: "automatic",
      researchSources: ["pubmed", "scielo"],
      yearRange: 5,
      supplementWithResearch: false,
    },
  });

  const watchedGenerationMode = watch("generationMode");
  const watchedSupplementWithResearch = watch("supplementWithResearch");

  // Memoize the file selection handler to prevent infinite loops
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      setValue("materialFiles", files);
    },
    [setValue],
  );

  const processSubmit: SubmitHandler<CreateProtocolFormValues> = async (
    data,
  ) => {
    console.log("[CreateProtocolForm] Data from react-hook-form:", data);

    setFormStatus("researching");
    setFormError(null);
    setResearchProgress("Iniciando pesquisa médica...");

    try {
      // Dynamic progress messages based on generation mode
      let messages: string[];

      if (data.generationMode === "material_based") {
        messages = [
          "📄 Processando documentos enviados...",
          "🔍 Extraindo conteúdo médico relevante...",
          "📊 Analisando estrutura do material...",
          "💊 Identificando medicamentos e dosagens...",
          "🔬 Validando informações médicas...",
        ];
        if (data.supplementWithResearch) {
          messages.push(
            "🌐 Buscando evidências complementares...",
            "📚 Cruzando com literatura científica...",
          );
        }
      } else if (data.generationMode === "automatic") {
        messages = [
          "🔍 Consultando PubMed e bases médicas...",
          "📚 Analisando literatura científica recente...",
          "🏥 Extraindo protocolos hospitalares similares...",
          "💡 Identificando melhores práticas clínicas...",
          "🧬 Correlacionando evidências encontradas...",
          "✨ Sintetizando informações coletadas...",
        ];
      } else {
        messages = [
          "📝 Preparando estrutura do protocolo...",
          "🏗️ Criando as 13 seções obrigatórias...",
          "✅ Protocolo pronto para edição manual...",
        ];
      }

      // Cycle through messages
      let messageIndex = 0;
      const progressInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setResearchProgress(messages[messageIndex]);
      }, 2500);

      // Store interval reference for cleanup
      setTimeout(() => clearInterval(progressInterval), 30000); // Max 30 seconds

      setFormStatus("loading");

      // Continue with dynamic messages during protocol creation
      const creationMessages =
        data.generationMode === "material_based"
          ? [
              "🏗️ Estruturando protocolo a partir do material...",
              "📋 Organizando as 13 seções obrigatórias...",
              "🔧 Aplicando formatação ABNT...",
              "✨ Finalizando protocolo médico...",
            ]
          : [
              "🧠 Aplicando inteligência artificial médica...",
              "📝 Gerando conteúdo baseado em evidências...",
              "🏥 Adaptando para contexto hospitalar...",
              "✅ Validando completude do protocolo...",
            ];

      let creationIndex = 0;
      const creationInterval = setInterval(() => {
        creationIndex = (creationIndex + 1) % creationMessages.length;
        setResearchProgress(creationMessages[creationIndex]);
      }, 3000);

      const result = await onSubmit(data);

      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(creationInterval);

      if (result.success) {
        setFormStatus("success");
        setResearchProgress("✅ Protocolo criado com sucesso!");
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

  const sourceLabels = {
    pubmed: "PubMed",
    scielo: "SciELO",
    cfm: "CFM",
    mec: "MEC",
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator during research */}
      {(formStatus === "researching" || formStatus === "loading") && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {formStatus === "researching"
                    ? "Pesquisando Literatura Médica"
                    : "Gerando Protocolo"}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {researchProgress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(processSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Título do Protocolo
              </Label>
              <Input
                id="title"
                placeholder="Ex: Protocolo de Atendimento à Bradicardia"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="condition" className="text-sm font-medium">
                Condição Médica Principal
              </Label>
              <Input
                id="condition"
                placeholder="Ex: Bradicardia sintomática"
                {...register("condition")}
                className={errors.condition ? "border-red-500" : ""}
              />
              {errors.condition && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.condition.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="targetPopulation" className="text-sm font-medium">
                População Alvo (Opcional)
              </Label>
              <Input
                id="targetPopulation"
                placeholder="Ex: Pacientes adultos em emergência"
                {...register("targetPopulation")}
                className={errors.targetPopulation ? "border-red-500" : ""}
              />
              {errors.targetPopulation && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.targetPopulation.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generation Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Modo de Geração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="automatic"
                  value="automatic"
                  {...register("generationMode")}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="automatic" className="flex-1 cursor-pointer">
                  <div className="font-medium">Geração Automática com IA</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    A IA gera todas as 13 seções do protocolo baseado na
                    pesquisa médica
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="manual"
                  value="manual"
                  {...register("generationMode")}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    Criação Manual com Assistência IA
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Você edita seção por seção com sugestões da IA baseadas na
                    pesquisa
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="material_based"
                  value="material_based"
                  {...register("generationMode")}
                  className="h-4 w-4 text-blue-600"
                />
                <Label
                  htmlFor="material_based"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">Baseado em Material Próprio</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Upload de documentos médicos para gerar protocolo
                    estruturado
                  </div>
                </Label>
              </div>
            </div>
            {errors.generationMode && (
              <p className="mt-2 text-xs text-red-600">
                {errors.generationMode.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Material Upload Section */}
        {watchedGenerationMode === "material_based" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Material Médico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                maxFiles={3}
                maxSize={10 * 1024 * 1024} // 10MB
                onFilesSelected={handleFilesSelected}
                accept={{
                  "application/pdf": [".pdf"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                  "text/plain": [".txt"],
                  "text/markdown": [".md", ".markdown"],
                }}
              />

              {/* Option to supplement with research */}
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="supplementWithResearch"
                  {...register("supplementWithResearch")}
                  className="h-4 w-4 text-blue-600"
                />
                <Label
                  htmlFor="supplementWithResearch"
                  className="cursor-pointer"
                >
                  <div className="font-medium">
                    Complementar com pesquisa científica
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Buscar evidências adicionais para enriquecer o protocolo
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Research Configuration */}
        {(watchedGenerationMode === "automatic" ||
          (watchedGenerationMode === "material_based" &&
            watchedSupplementWithResearch)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Configuração da Pesquisa Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Fontes de Pesquisa
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["pubmed", "scielo", "cfm", "mec"] as const).map(
                    (source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={source}
                          value={source}
                          {...register("researchSources")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor={source} className="cursor-pointer">
                          {sourceLabels[source]}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
                {errors.researchSources && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.researchSources.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="yearRange" className="text-sm font-medium">
                  Período de Pesquisa (anos)
                </Label>
                <select
                  id="yearRange"
                  {...register("yearRange", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={1}>Último ano</option>
                  <option value={3}>Últimos 3 anos</option>
                  <option value={5}>Últimos 5 anos</option>
                  <option value={10}>Últimos 10 anos</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {formStatus === "error" && formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro!</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {formStatus === "success" && (
          <Alert className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">
              Protocolo Criado com Sucesso!
            </AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              Pesquisa médica concluída. Redirecionando para o editor...
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={formStatus === "loading" || formStatus === "researching"}
            size="lg"
          >
            {formStatus === "researching" ? (
              <>
                <Search className="mr-2 h-4 w-4 animate-spin" />
                Pesquisando...
              </>
            ) : formStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Protocolo...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                {watchedGenerationMode === "automatic"
                  ? "Gerar Protocolo Completo"
                  : watchedGenerationMode === "material_based"
                    ? "Processar Material e Criar Protocolo"
                    : "Iniciar Criação Manual"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
