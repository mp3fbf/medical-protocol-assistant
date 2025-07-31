"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ProtocolContext, 
  CONTEXT_DEFINITIONS,
  type ContextDefinition 
} from "@/types/protocol-context";

interface ContextSelectorProps {
  value?: ProtocolContext;
  onChange: (context: ProtocolContext) => void;
  error?: string;
}

export function ContextSelector({ value, onChange, error }: ContextSelectorProps) {
  const [selectedContext, setSelectedContext] = React.useState<ProtocolContext | undefined>(value);

  const handleContextChange = (newValue: string) => {
    const context = newValue as ProtocolContext;
    setSelectedContext(context);
    onChange(context);
  };

  // Convert object to array for mapping
  const contextOptions = Object.values(CONTEXT_DEFINITIONS);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Contexto de Atendimento <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Escolha o ambiente onde o protocolo será aplicado. Isso mudará completamente como o conteúdo é gerado.
        </p>
      </div>
      
      <RadioGroup 
        value={selectedContext} 
        onValueChange={handleContextChange}
        className="grid gap-3 md:grid-cols-2"
      >
        {contextOptions.map((option: ContextDefinition) => {
          const Icon = option.icon;
          const isSelected = selectedContext === option.value;
          
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300",
                "hover:shadow-md hover:scale-[1.01]",
                isSelected
                  ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                  : "border-gray-200 hover:border-primary-300 dark:border-gray-700",
                error && "border-red-300"
              )}
            >
              <RadioGroupItem 
                value={option.value} 
                className="sr-only"
                id={`context-${option.value}`}
              />
              
              <div className="flex gap-4 flex-1">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                    "bg-gradient-to-br",
                    option.color === "red" && "from-red-500 to-red-600",
                    option.color === "blue" && "from-blue-500 to-blue-600",
                    option.color === "purple" && "from-purple-500 to-purple-600",
                    option.color === "green" && "from-green-500 to-green-600",
                    option.color === "indigo" && "from-indigo-500 to-indigo-600",
                    option.color === "orange" && "from-orange-500 to-orange-600",
                    option.color === "teal" && "from-teal-500 to-teal-600",
                    option.color === "pink" && "from-pink-500 to-pink-600",
                    "text-white shadow-lg"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {option.label}
                    </span>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                  
                  <div className="pt-1 space-y-0.5">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {option.characteristics.timeFrame}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {option.characteristics.focus}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                </div>
              )}
            </label>
          );
        })}
      </RadioGroup>
      
      {/* Detailed preview for selected context */}
      {selectedContext && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span>Este protocolo será gerado com:</span>
            <Badge variant="outline" className="text-xs">
              {CONTEXT_DEFINITIONS[selectedContext].label}
            </Badge>
          </h4>
          <ul className="space-y-1.5">
            {CONTEXT_DEFINITIONS[selectedContext].preview.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="text-lg">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}