import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
              Assistente de Protocolos Médicos
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
              Crie, edite e gerencie protocolos médicos com inteligência
              artificial. Padronização, qualidade e eficiência para sua
              instituição de saúde.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="px-8 py-6 text-lg">
                <Link href="/login">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg"
                asChild
              >
                <Link href="#features">Conhecer Recursos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Recursos Principais
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Ferramentas poderosas para criar protocolos médicos de qualidade
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 transition-colors hover:border-blue-200">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Geração com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Crie protocolos completos baseados em evidências científicas
                  usando inteligência artificial avançada.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-colors hover:border-green-200">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Editor Avançado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Interface intuitiva para editar todos os 13 componentes de um
                  protocolo médico completo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-colors hover:border-purple-200">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Controle de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Sistema de revisão e aprovação com diferentes níveis de acesso
                  e auditoria completa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-colors hover:border-orange-200">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Padrão ABNT</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Exportação automática para DOCX e PDF seguindo rigorosamente
                  os padrões ABNT médicos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-colors hover:border-indigo-200">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>Colaboração</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Trabalhe em equipe com diferentes papéis: criadores, revisores
                  e administradores.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-colors hover:border-teal-200">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900">
                  <Clock className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle>Versionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Histórico completo de versões com rastreabilidade de todas as
                  mudanças realizadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Por que Escolher Nossa Plataforma?
            </h2>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Redução de Tempo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Crie protocolos em minutos ao invés de horas, mantendo a
                    qualidade e precisão.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Padronização Institucional
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Garanta consistência em todos os protocolos da sua
                    instituição.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Baseado em Evidências
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Protocolos fundamentados nas melhores práticas e literatura
                    médica atual.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
              <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Comece Hoje Mesmo
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Junte-se às instituições que já estão modernizando seus
                protocolos médicos.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/login">
                  Acessar Plataforma
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
