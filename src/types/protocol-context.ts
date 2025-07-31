/**
 * Protocol Context Types and Definitions
 * 
 * This module defines the different contexts where medical protocols can be applied,
 * fundamentally changing how the content is generated and structured.
 */

import type { LucideIcon } from "lucide-react";
import { 
  Siren, 
  Calendar, 
  Heart, 
  Building2, 
  Video, 
  Truck, 
  Home,
  Stethoscope 
} from "lucide-react";

// Mirror the Prisma enum
export enum ProtocolContext {
  EMERGENCY_ROOM = "EMERGENCY_ROOM",
  AMBULATORY = "AMBULATORY",
  ICU = "ICU",
  WARD = "WARD",
  TELEMEDICINE = "TELEMEDICINE",
  TRANSPORT = "TRANSPORT",
  HOME_CARE = "HOME_CARE",
  SURGICAL_CENTER = "SURGICAL_CENTER"
}

export interface ContextDefinition {
  value: ProtocolContext;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  characteristics: {
    timeFrame: string;
    focus: string;
    resources: string;
    outputType: string;
  };
  preview: string[];
}

export const CONTEXT_DEFINITIONS: Record<ProtocolContext, ContextDefinition> = {
  [ProtocolContext.EMERGENCY_ROOM]: {
    value: ProtocolContext.EMERGENCY_ROOM,
    label: "Pronto Atendimento",
    description: "Decisões rápidas, foco em triagem e alta segura",
    icon: Siren,
    color: "red",
    characteristics: {
      timeFrame: "Decisões em minutos",
      focus: "Triagem de risco, estabilização, decisão alta/internação",
      resources: "Medicamentos DEF, exames básicos",
      outputType: "Protocolo fast-track com checklists binários"
    },
    preview: [
      "✓ Triagem de risco em < 2 minutos",
      "✓ Apenas medicamentos do PA",
      "✓ Decisão binária: alta vs internação",
      "✓ Foco em diminuir permanência"
    ]
  },
  [ProtocolContext.AMBULATORY]: {
    value: ProtocolContext.AMBULATORY,
    label: "Ambulatório",
    description: "Acompanhamento detalhado e tratamento continuado",
    icon: Calendar,
    color: "blue",
    characteristics: {
      timeFrame: "Acompanhamento em semanas/meses",
      focus: "Diagnóstico detalhado, tratamento continuado",
      resources: "Exames especializados, medicamentos de alto custo",
      outputType: "Protocolo completo com seguimento"
    },
    preview: [
      "✓ Avaliação completa e detalhada",
      "✓ Exames especializados",
      "✓ Tratamento escalonado",
      "✓ Follow-up programado"
    ]
  },
  [ProtocolContext.ICU]: {
    value: ProtocolContext.ICU,
    label: "UTI",
    description: "Cuidados intensivos e monitorização contínua",
    icon: Heart,
    color: "purple",
    characteristics: {
      timeFrame: "Monitorização contínua",
      focus: "Suporte vital, prevenção de complicações",
      resources: "Todos disponíveis, foco em drogas vasoativas",
      outputType: "Protocolo de cuidados intensivos"
    },
    preview: [
      "✓ Monitorização multiparamétrica",
      "✓ Suporte ventilatório e hemodinâmico",
      "✓ Sedação e analgesia otimizadas",
      "✓ Prevenção de complicações"
    ]
  },
  [ProtocolContext.WARD]: {
    value: ProtocolContext.WARD,
    label: "Enfermaria",
    description: "Cuidados hospitalares de complexidade intermediária",
    icon: Building2,
    color: "green",
    characteristics: {
      timeFrame: "Dias a semanas de internação",
      focus: "Estabilização clínica, preparação para alta",
      resources: "Medicamentos hospitalares, exames de rotina",
      outputType: "Protocolo de cuidados hospitalares"
    },
    preview: [
      "✓ Monitorização diária",
      "✓ Transição de cuidados",
      "✓ Preparação para alta",
      "✓ Educação do paciente"
    ]
  },
  [ProtocolContext.TELEMEDICINE]: {
    value: ProtocolContext.TELEMEDICINE,
    label: "Telemedicina",
    description: "Atendimento remoto com recursos limitados",
    icon: Video,
    color: "indigo",
    characteristics: {
      timeFrame: "Consulta de 15-30 minutos",
      focus: "Triagem remota, orientação, encaminhamento",
      resources: "Apenas anamnese e inspeção visual",
      outputType: "Protocolo de decisão remota"
    },
    preview: [
      "✓ Avaliação por videochamada",
      "✓ Orientações de autocuidado",
      "✓ Critérios de encaminhamento presencial",
      "✓ Prescrição digital quando aplicável"
    ]
  },
  [ProtocolContext.TRANSPORT]: {
    value: ProtocolContext.TRANSPORT,
    label: "Remoção/Transporte",
    description: "Estabilização e cuidados durante transporte",
    icon: Truck,
    color: "orange",
    characteristics: {
      timeFrame: "Minutos a horas",
      focus: "Estabilização para transporte seguro",
      resources: "Kit de emergência móvel",
      outputType: "Protocolo de transporte seguro"
    },
    preview: [
      "✓ Estabilização pré-transporte",
      "✓ Monitorização durante trajeto",
      "✓ Equipamentos portáteis essenciais",
      "✓ Comunicação com destino"
    ]
  },
  [ProtocolContext.HOME_CARE]: {
    value: ProtocolContext.HOME_CARE,
    label: "Atenção Domiciliar",
    description: "Cuidados em ambiente domiciliar",
    icon: Home,
    color: "teal",
    characteristics: {
      timeFrame: "Visitas programadas",
      focus: "Cuidados domiciliares, educação familiar",
      resources: "Recursos portáteis, medicamentos orais",
      outputType: "Protocolo de cuidado domiciliar"
    },
    preview: [
      "✓ Adaptação ao ambiente domiciliar",
      "✓ Treinamento de cuidadores",
      "✓ Medicações de fácil administração",
      "✓ Sinais de alerta para família"
    ]
  },
  [ProtocolContext.SURGICAL_CENTER]: {
    value: ProtocolContext.SURGICAL_CENTER,
    label: "Centro Cirúrgico",
    description: "Cuidados perioperatórios",
    icon: Stethoscope,
    color: "pink",
    characteristics: {
      timeFrame: "Pré, trans e pós-operatório imediato",
      focus: "Segurança cirúrgica, prevenção de complicações",
      resources: "Anestésicos, monitorização completa",
      outputType: "Protocolo perioperatório"
    },
    preview: [
      "✓ Checklist de segurança cirúrgica",
      "✓ Profilaxia antibiótica",
      "✓ Manejo de dor pós-operatória",
      "✓ Critérios de alta da recuperação"
    ]
  }
};

/**
 * Get context description for prompts
 */
export function getContextDescription(context: ProtocolContext): string {
  const definition = CONTEXT_DEFINITIONS[context];
  return `${definition.label} - ${definition.characteristics.focus}`;
}

/**
 * Get context color for UI
 */
export function getContextColor(context: ProtocolContext): string {
  return CONTEXT_DEFINITIONS[context].color;
}

/**
 * Get context icon component
 */
export function getContextIcon(context: ProtocolContext): LucideIcon {
  return CONTEXT_DEFINITIONS[context].icon;
}

/**
 * Check if context requires fast decision making
 */
export function isFastTrackContext(context: ProtocolContext): boolean {
  return [
    ProtocolContext.EMERGENCY_ROOM,
    ProtocolContext.TRANSPORT,
    ProtocolContext.SURGICAL_CENTER
  ].includes(context);
}

/**
 * Check if context allows complex exams
 */
export function allowsComplexExams(context: ProtocolContext): boolean {
  return [
    ProtocolContext.AMBULATORY,
    ProtocolContext.ICU,
    ProtocolContext.WARD
  ].includes(context);
}