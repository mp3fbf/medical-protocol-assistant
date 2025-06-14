/**
 * CreateProtocolForm Ultra component
 * A premium form for initiating the creation of a new medical protocol with AI research.
 */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UltraGradientButton } from "@/components/ui/ultra-button";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import { UltraBadge } from "@/components/ui/ultra-badge";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  FileText,
  Zap,
  Upload,
  Brain,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  materialFiles: z.array(z.any()).optional(),
  supplementWithResearch: z.boolean().default(false).optional(),
});

export type CreateProtocolFormValues = z.infer<typeof createProtocolFormSchema>;

interface CreateProtocolFormProps {
  onSubmit: (
    data: CreateProtocolFormValues,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  onSuccess?: (data?: any) => void;
}

// Generation mode configurations
const generationModes = [
  {
    id: "automatic",
    title: "Geração Automática com IA",
    description: "Pesquisa completa e geração inteligente de conteúdo",
    icon: Brain,
    color: "from-primary-500 to-indigo-600",
    features: [
      "Pesquisa em bases médicas",
      "Geração completa com IA",
      "Baseado em evidências",
    ],
  },
  {
    id: "manual",
    title: "Criação Manual",
    description: "Estrutura básica para preenchimento manual",
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
    features: [
      "13 seções estruturadas",
      "Controle total",
      "Validação integrada",
    ],
  },
  {
    id: "material_based",
    title: "Baseado em Material",
    description: "Upload de documentos para geração assistida",
    icon: Upload,
    color: "from-purple-500 to-pink-600",
    features: [
      "Upload PDF/DOCX/TXT",
      "Extração inteligente",
      "Formatação automática",
    ],
  },
];

// Research source configurations
const researchSources = [
  { id: "pubmed", label: "PubMed", icon: "🔬" },
  { id: "scielo", label: "SciELO", icon: "📚" },
  { id: "cfm", label: "CFM", icon: "🏥" },
  { id: "mec", label: "MEC", icon: "🎓" },
];

export const CreateProtocolFormUltra: React.FC<CreateProtocolFormProps> = ({
  onSubmit,
  onSuccess,
}) => {
  const [formStatus, setFormStatus] = useState<
    "idle" | "researching" | "loading" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [researchProgress, setResearchProgress] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  useEffect(() => {
    setIsFormLoaded(true);
  }, []);

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
  const watchedResearchSources = watch("researchSources") || [];

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      setValue("materialFiles", files);
    },
    [setValue],
  );

  const toggleResearchSource = (sourceId: string) => {
    const currentSources = watchedResearchSources;
    const newSources = currentSources.includes(sourceId as any)
      ? currentSources.filter((s) => s !== sourceId)
      : [...currentSources, sourceId as any];
    setValue("researchSources", newSources);
  };

  const processSubmit: SubmitHandler<CreateProtocolFormValues> = async (
    data,
  ) => {
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

      setTimeout(() => clearInterval(progressInterval), 30000);

      setFormStatus("loading");

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

  return (
    <div className="space-y-6">
      {/* Progress indicator during research */}
      {(formStatus === "researching" || formStatus === "loading") && (
        <UltraGlassCard className="border-blue-200 bg-blue-50/30 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="absolute inset-0 animate-pulse bg-blue-600/30 blur-xl" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {formStatus === "researching"
                  ? "Pesquisando Literatura Médica"
                  : "Gerando Protocolo"}
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {researchProgress}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
            <div
              className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: formStatus === "researching" ? "40%" : "80%" }}
            />
          </div>
        </UltraGlassCard>
      )}

      <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div
          className={cn(
            "space-y-4 transition-all duration-700",
            isFormLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0",
          )}
        >
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
          </div>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              Título do Protocolo <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Protocolo de Atendimento à Bradicardia"
              aria-required="true"
              {...register("title")}
              className={cn(
                "w-full bg-white/50 px-4 py-3 backdrop-blur-sm dark:bg-gray-800/50",
                "rounded-xl border border-gray-200 dark:border-gray-700",
                "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500",
                "transition-all duration-300 placeholder:text-gray-400",
                errors.title && "border-red-500 focus:ring-red-500",
              )}
            />
            {errors.title && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="condition"
              className="mb-2 block text-sm font-medium"
            >
              Condição Médica Principal <span className="text-red-500">*</span>
            </label>
            <input
              id="condition"
              type="text"
              placeholder="Ex: Bradicardia sintomática"
              aria-required="true"
              {...register("condition")}
              className={cn(
                "w-full bg-white/50 px-4 py-3 backdrop-blur-sm dark:bg-gray-800/50",
                "rounded-xl border border-gray-200 dark:border-gray-700",
                "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500",
                "transition-all duration-300 placeholder:text-gray-400",
                errors.condition && "border-red-500 focus:ring-red-500",
              )}
            />
            {errors.condition && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.condition.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="targetPopulation"
              className="mb-2 block text-sm font-medium"
            >
              População Alvo <span className="text-gray-400">(Opcional)</span>
            </label>
            <input
              id="targetPopulation"
              type="text"
              placeholder="Ex: Pacientes adultos em emergência"
              {...register("targetPopulation")}
              className={cn(
                "w-full bg-white/50 px-4 py-3 backdrop-blur-sm dark:bg-gray-800/50",
                "rounded-xl border border-gray-200 dark:border-gray-700",
                "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500",
                "transition-all duration-300 placeholder:text-gray-400",
                errors.targetPopulation && "border-red-500 focus:ring-red-500",
              )}
            />
            {errors.targetPopulation && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.targetPopulation.message}
              </p>
            )}
          </div>
        </div>

        {/* Generation Mode Selection */}
        <div
          className={cn(
            "space-y-4 transition-all delay-100 duration-700",
            isFormLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0",
          )}
        >
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold">
              Modo de Geração <span className="text-red-500">*</span>
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {generationModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = watchedGenerationMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setValue("generationMode", mode.id as any)}
                  className={cn(
                    "group relative rounded-xl border-2 p-6 transition-all duration-300",
                    "transform-gpu hover:scale-[1.02] hover:shadow-lg",
                    isSelected
                      ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                      : "border-gray-200 hover:border-primary-300 dark:border-gray-700",
                  )}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <UltraBadge status="success" size="sm">
                        Selecionado
                      </UltraBadge>
                    </div>
                  )}

                  <div
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-lg",
                      "bg-gradient-to-br",
                      mode.color,
                      "text-white",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h4 className="mb-2 text-left font-semibold">{mode.title}</h4>
                  <p className="mb-3 text-left text-sm text-gray-600 dark:text-gray-400">
                    {mode.description}
                  </p>

                  <ul className="space-y-1">
                    {mode.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <Check className="h-3 w-3 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* Research Configuration (for automatic mode) */}
        {(watchedGenerationMode === "automatic" ||
          (watchedGenerationMode === "material_based" &&
            watchedSupplementWithResearch)) && (
          <div
            className={cn(
              "space-y-4 transition-all delay-200 duration-700",
              isFormLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary-500" />
              <h3 className="text-lg font-semibold">
                Configuração de Pesquisa
              </h3>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">
                Fontes de Pesquisa <span className="text-red-500">*</span>
              </label>
              <div
                className="grid grid-cols-2 gap-3 md:grid-cols-4"
                role="group"
              >
                {researchSources.map((source) => {
                  const isSelected = watchedResearchSources.includes(
                    source.id as any,
                  );
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => toggleResearchSource(source.id)}
                      className={cn(
                        "rounded-lg border-2 p-3 transition-all duration-300",
                        "transform-gpu hover:scale-[1.02]",
                        isSelected
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 hover:border-primary-300 dark:border-gray-700",
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">{source.icon}</span>
                        <span className="text-sm font-medium">
                          {source.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="yearRange"
                className="mb-2 block text-sm font-medium"
              >
                Período de Pesquisa
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="yearRange"
                  type="range"
                  min="1"
                  max="10"
                  {...register("yearRange", { valueAsNumber: true })}
                  className="flex-1"
                />
                <span className="w-20 text-sm font-medium">
                  Últimos {watch("yearRange")} anos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Material Upload (for material_based mode) */}
        {watchedGenerationMode === "material_based" && (
          <div
            className={cn(
              "space-y-4 transition-all delay-200 duration-700",
              isFormLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            <div className="mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary-500" />
              <h3 className="text-lg font-semibold">Upload de Material</h3>
            </div>

            <FileUpload
              onFilesSelected={handleFilesSelected}
              onFileRemove={(index) => {
                const newFiles = uploadedFiles.filter((_, i) => i !== index);
                setUploadedFiles(newFiles);
                setValue("materialFiles", newFiles);
              }}
            />

            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <input
                id="supplementWithResearch"
                type="checkbox"
                {...register("supplementWithResearch")}
                className="h-4 w-4 rounded text-primary-600"
              />
              <label htmlFor="supplementWithResearch" className="text-sm">
                Complementar com pesquisa adicional em bases médicas
              </label>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <UltraGradientButton
            type="submit"
            size="lg"
            disabled={formStatus === "researching" || formStatus === "loading"}
            icon={
              formStatus === "researching" || formStatus === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )
            }
          >
            {formStatus === "researching" || formStatus === "loading"
              ? "Processando..."
              : "Criar Protocolo"}
          </UltraGradientButton>
        </div>
      </form>

      {/* Success Message */}
      {formStatus === "success" && (
        <UltraGlassCard className="border-emerald-200 bg-emerald-50/30 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/50">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                Protocolo Criado com Sucesso!
              </h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Você será redirecionado para o editor em instantes...
              </p>
            </div>
          </div>
        </UltraGlassCard>
      )}

      {/* Error Message */}
      {formStatus === "error" && formError && (
        <UltraGlassCard className="border-red-200 bg-red-50/30 p-6 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Erro ao Criar Protocolo
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {formError}
              </p>
            </div>
          </div>
        </UltraGlassCard>
      )}
    </div>
  );
};
