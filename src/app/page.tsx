"use client";

import React, { useState, useEffect } from "react";
import { UltraGradientButton, UltraButton } from "@/components/ui/ultra-button";
import { UltraGlassCard, UltraFeaturedCard } from "@/components/ui/ultra-card";
import {
  Brain,
  Activity,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  FileText,
  Globe,
  Award,
  Play,
  CheckCircle,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    // Animation trigger already set to true by default
    setIsLoaded(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "IA Médica Avançada",
      description:
        "Modelos treinados com milhões de papers médicos e diretrizes atualizadas",
      color: "from-primary-500 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Validação Automática",
      description:
        "Sistema inteligente que verifica conformidade e segurança médica",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Workflow,
      title: "Fluxogramas Inteligentes",
      description: "Geração automática de fluxos de atendimento com IA",
      color: "from-amber-500 to-orange-600",
    },
  ];

  const stats = [
    { value: "500+", label: "Protocolos Criados", icon: FileText },
    { value: "50+", label: "Instituições", icon: Globe },
    { value: "98%", label: "Satisfação", icon: Award },
    { value: "10x", label: "Mais Rápido", icon: Zap },
  ];

  const testimonials = [
    {
      name: "Dr. Marina Santos",
      role: "Diretora Médica - Hospital São Lucas",
      text: "Revolucionou nossa forma de criar protocolos. O que levava semanas agora fazemos em horas.",
      avatar: "MS",
    },
    {
      name: "Dr. Roberto Lima",
      role: "Coordenador UTI - Hospital Central",
      text: "A IA é impressionante. Gera protocolos baseados em evidências atualizadas automaticamente.",
      avatar: "RL",
    },
    {
      name: "Dra. Ana Costa",
      role: "Chefe de Emergência - Pronto Socorro Municipal",
      text: "Interface intuitiva e resultados profissionais. Nossa equipe adotou imediatamente.",
      avatar: "AC",
    },
  ];

  return (
    <div
      id="main-content"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Theme Toggle in the top right */}
        <div className="absolute right-4 top-4 z-50 sm:right-6 sm:top-6">
          <ThemeToggle size="md" />
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='medical' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M30 10 L30 50 M10 30 L50 30' stroke='%234f46e5' stroke-width='0.5' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23medical)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute left-1/4 top-0 -z-10 h-96 w-96 animate-pulse rounded-full bg-primary-200 opacity-20 blur-3xl" />
        <div
          className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-purple-200 opacity-20 blur-3xl"
          style={{ animationDelay: "2s" }}
        />

        <div className="container relative z-10 mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className={cn(
                "mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 px-4 py-2 dark:from-primary-900/20 dark:to-purple-900/20",
                "border border-primary-200 transition-all duration-700 dark:border-primary-700",
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-4 opacity-0",
              )}
            >
              <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                Powered by AI
              </span>
            </div>

            {/* Title */}
            <h1
              className={cn(
                "mb-6 text-5xl font-bold transition-all duration-1000 md:text-7xl",
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0",
              )}
            >
              <span className="text-gray-900 dark:text-white">
                Assistente de
              </span>
              <br />
              <span className="font-extrabold text-primary-600">
                Protocolos Médicos
              </span>
            </h1>

            {/* Description */}
            <p
              className={cn(
                "mx-auto mb-10 max-w-2xl text-xl font-medium text-gray-700 dark:text-gray-300",
                "transition-all delay-200 duration-1000",
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0",
              )}
            >
              Crie, edite e gerencie protocolos médicos com inteligência
              artificial. Padronização, qualidade e eficiência para sua
              instituição de saúde.
            </p>

            {/* CTA Buttons */}
            <div
              className={cn(
                "mb-12 flex flex-col justify-center gap-4 sm:flex-row",
                "transition-all delay-300 duration-1000",
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0",
              )}
            >
              <Link href="/login" className="inline-block">
                <UltraGradientButton
                  size="lg"
                  className="whitespace-nowrap px-8"
                >
                  <Brain className="h-5 w-5" />
                  <span>Começar Agora</span>
                  <ArrowRight className="h-5 w-5" />
                </UltraGradientButton>
              </Link>

              <UltraButton
                variant="secondary"
                size="md"
                className="inline-flex items-center gap-2 whitespace-nowrap px-8"
                icon={<Play className="h-4 w-4" />}
              >
                Conhecer Recursos
              </UltraButton>
            </div>

            {/* Trust Indicators */}
            <div
              className={cn(
                "flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400",
                "delay-400 transition-all duration-1000",
                isLoaded ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>LGPD Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Recursos Principais
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-gray-700 dark:text-gray-300">
              Ferramentas poderosas para criar protocolos médicos de qualidade
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature Cards */}
            <UltraFeaturedCard className="group cursor-pointer">
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 transition-transform duration-500 group-hover:scale-110">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                  Geração com IA
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Crie protocolos completos baseados em evidências científicas
                  usando inteligência artificial avançada.
                </p>

                <div className="flex items-center font-medium text-primary-600 dark:text-primary-400">
                  <span>Explorar</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </UltraFeaturedCard>

            <UltraFeaturedCard className="group cursor-pointer">
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 transition-transform duration-500 group-hover:scale-110">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                  Editor Avançado
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Interface intuitiva para editar todos os 13 componentes de um
                  protocolo médico completo.
                </p>

                <div className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Descobrir</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </UltraFeaturedCard>

            <UltraFeaturedCard className="group cursor-pointer">
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 transition-transform duration-500 group-hover:scale-110">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                  Controle de Qualidade
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Sistema de revisão e aprovação com diferentes níveis de acesso
                  e auditoria completa.
                </p>

                <div className="flex items-center font-medium text-purple-600 dark:text-purple-400">
                  <span>Ver mais</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </UltraFeaturedCard>
          </div>

          {/* Interactive Feature Display */}
          <div className="mt-20">
            <UltraGlassCard className="p-8 md:p-12">
              <div className="grid items-center gap-12 md:grid-cols-2">
                <div>
                  <div className="mb-8 flex gap-2">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        className={cn(
                          "h-2 w-2 rounded-full transition-all duration-300",
                          activeFeature === index
                            ? "w-8 bg-primary-600"
                            : "bg-gray-300 dark:bg-gray-600",
                        )}
                      />
                    ))}
                  </div>

                  <div className="relative h-32">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className={cn(
                          "absolute inset-0 transition-all duration-500",
                          activeFeature === index
                            ? "translate-x-0 opacity-100"
                            : "translate-x-10 opacity-0",
                        )}
                      >
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {/* Animated medical icons */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                          <div
                            key={index}
                            className={cn(
                              "absolute transition-all duration-700",
                              activeFeature === index
                                ? "scale-100 opacity-100"
                                : "scale-75 opacity-0",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-32 w-32 items-center justify-center rounded-full",
                                `bg-gradient-to-br ${feature.color}`,
                              )}
                            >
                              <Icon className="h-16 w-16 text-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </UltraGlassCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "text-center transition-all duration-700",
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0",
                  )}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-gray-800">
                    <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Médicos que Confiam
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <UltraGlassCard
                key={i}
                className="p-6 transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="italic text-gray-700 dark:text-gray-300">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </UltraGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-50 to-indigo-50 py-20 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Comece a Revolução
            </h2>

            <p className="mb-10 text-xl font-medium text-gray-700 dark:text-gray-300">
              Junte-se aos pioneiros da medicina digital. Teste gratuitamente
              por 30 dias.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <UltraGradientButton
                  size="md"
                  className="inline-flex items-center gap-2 whitespace-nowrap px-8"
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Começar Agora - Grátis
                </UltraGradientButton>
              </Link>

              <UltraButton
                variant="secondary"
                size="md"
                className="whitespace-nowrap px-8"
              >
                Falar com Especialista
              </UltraButton>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Não é necessário cartão de crédito • Setup em 2 minutos
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
