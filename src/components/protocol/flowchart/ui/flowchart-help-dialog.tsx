/**
 * Help dialog for flowchart editing instructions
 */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MousePointer,
  Move,
  GitBranch,
  Trash2,
  Edit3,
  Maximize2,
  Info,
  X,
} from "lucide-react";

interface FlowchartHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain?: (value: boolean) => void;
}

export const FlowchartHelpDialog: React.FC<FlowchartHelpDialogProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[100] bg-black/80" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] max-h-[80vh] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg">
          <DialogPrimitive.Close
            onClick={() => {
              if (dontShowAgain && onDontShowAgain) {
                onDontShowAgain(true);
              }
              onClose();
            }}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Como usar o Editor de Fluxograma
            </DialogTitle>
            <DialogDescription>
              Guia rápido para criar e editar fluxogramas de protocolos médicos
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Adding Nodes */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <GitBranch className="h-5 w-5 text-blue-600" />
                Adicionando Nós
              </h3>
              <p className="mb-2 text-sm text-gray-600">
                Use a barra de ferramentas superior para adicionar novos nós:
              </p>
              <ul className="ml-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">
                    • Início:
                  </span>
                  <span>Ponto de entrada do protocolo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-red-600">• Fim:</span>
                  <span>Finalização do protocolo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">
                    • Triagem:
                  </span>
                  <span>Avaliação inicial do paciente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-yellow-600">
                    • Decisão:
                  </span>
                  <span>Pontos de decisão com critérios específicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600">• Ação:</span>
                  <span>Procedimentos ou intervenções</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-orange-600">
                    • Medicação:
                  </span>
                  <span>Administração de medicamentos</span>
                </li>
              </ul>
            </section>

            {/* Making Connections */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <MousePointer className="h-5 w-5 text-blue-600" />
                Fazendo Conexões
              </h3>
              <div className="rounded-lg bg-blue-50 p-4 text-sm">
                <p className="mb-2 font-semibold">⚠️ Importante:</p>
                <p className="mb-2">
                  Para conectar nós, você deve{" "}
                  <strong>arrastar a partir dos pontos coloridos</strong>{" "}
                  (handles) nas bordas dos nós, NÃO clique no centro do nó.
                </p>
                <ol className="mt-3 list-inside list-decimal space-y-1">
                  <li>
                    Posicione o mouse sobre um <strong>ponto colorido</strong>{" "}
                    na borda do nó
                  </li>
                  <li>
                    Clique e <strong>arraste</strong> até outro nó
                  </li>
                  <li>Solte sobre um ponto de conexão do nó destino</li>
                  <li>
                    Os pontos ficam <strong>verdes</strong> quando a conexão é
                    válida
                  </li>
                </ol>
              </div>
            </section>

            {/* Editing Nodes */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Edit3 className="h-5 w-5 text-blue-600" />
                Editando Nós
              </h3>
              <p className="mb-2 text-sm text-gray-600">
                Para editar o conteúdo de um nó:
              </p>
              <ul className="ml-4 space-y-2 text-sm">
                <li>
                  • <strong>Clique duas vezes</strong> no nó para abrir o editor
                </li>
                <li>• Modifique título, prioridade e conteúdo específico</li>
                <li>
                  • Clique em &quot;Salvar&quot; para confirmar as alterações
                </li>
              </ul>
            </section>

            {/* Moving and Organizing */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Move className="h-5 w-5 text-blue-600" />
                Movendo e Organizando
              </h3>
              <ul className="ml-4 space-y-2 text-sm">
                <li>
                  • <strong>Arrastar nós:</strong> Clique e segure no centro do
                  nó
                </li>
                <li>
                  • <strong>Mover canvas:</strong> Clique e arraste no fundo
                </li>
                <li>
                  • <strong>Zoom:</strong> Use a roda do mouse ou os controles
                </li>
                <li>
                  • <strong>Selecionar múltiplos:</strong> Segure Ctrl e clique
                </li>
              </ul>
            </section>

            {/* Deleting Elements */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Trash2 className="h-5 w-5 text-red-600" />
                Deletando Elementos
              </h3>
              <ul className="ml-4 space-y-2 text-sm">
                <li>• Selecione um ou mais nós clicando neles</li>
                <li>
                  • Pressione a tecla{" "}
                  <kbd className="rounded bg-gray-200 px-2 py-1">Delete</kbd>
                </li>
                <li>
                  • Ou use o botão &quot;Deletar&quot; na barra de ferramentas
                </li>
                <li>
                  • As conexões relacionadas são removidas automaticamente
                </li>
              </ul>
            </section>

            {/* Tips */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Info className="h-5 w-5 text-green-600" />
                Dicas Úteis
              </h3>
              <ul className="ml-4 space-y-2 text-sm">
                <li>
                  • Os nós se alinham automaticamente em uma grade invisível
                </li>
                <li>
                  • Nós de decisão têm duas saídas: &quot;Sim&quot; (verde) e
                  &quot;Não&quot; (vermelho)
                </li>
                <li>• Use cores de prioridade para destacar passos críticos</li>
                <li>
                  • Salve frequentemente usando o botão &quot;Salvar&quot; na
                  barra
                </li>
                <li>
                  • Use <Maximize2 className="inline h-4 w-4" /> para editar em
                  tela cheia
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) => {
                  setDontShowAgain(checked as boolean);
                }}
              />
              <label
                htmlFor="dont-show-again"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Não mostrar novamente
              </label>
            </div>
            <Button
              onClick={() => {
                if (dontShowAgain && onDontShowAgain) {
                  onDontShowAgain(true);
                }
                onClose();
              }}
            >
              Entendi
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
