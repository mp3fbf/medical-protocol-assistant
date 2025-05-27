/**
 * ProtocolCard component
 * Displays information about a single protocol in a card format.
 */
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Edit, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtocolStatus } from "@prisma/client"; // Changed from type-only import

export interface ProtocolCardProps {
  id: string;
  title: string;
  condition: string;
  status: ProtocolStatus | string; // Allow string for mock data flexibility
  updatedAt: string; // Formatted date string
  versionCount?: number;
  latestVersionNumber?: number;
}

const statusStyles: Record<
  string,
  { badge: string; text: string; iconText?: string }
> = {
  DRAFT: {
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100",
    text: "Rascunho",
    iconText: "Em Edição",
  },
  REVIEW: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100",
    text: "Em Revisão",
    iconText: "Revisão",
  },
  APPROVED: {
    badge: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
    text: "Aprovado",
    iconText: "Aprovado",
  },
  ARCHIVED: {
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    text: "Arquivado",
    iconText: "Arquivado",
  },
  default: { badge: "bg-gray-200 text-gray-700", text: "Desconhecido" },
};

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  id,
  title,
  condition,
  status,
  updatedAt,
  versionCount,
  latestVersionNumber,
}) => {
  const currentStatusStyle = statusStyles[status] || statusStyles.default;

  return (
    <Card className="flex h-full flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="mb-2 flex items-start justify-between">
          <FileText className="dark:text-primary-400 h-8 w-8 text-primary-500" />
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              currentStatusStyle.badge,
            )}
          >
            {currentStatusStyle.text}
          </span>
        </div>
        <CardTitle className="truncate text-lg font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p className="text-gray-600 dark:text-gray-300">
          <span className="font-medium">Condição:</span> {condition}
        </p>
        {latestVersionNumber && (
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium">Versão Atual:</span>{" "}
            {latestVersionNumber}
          </p>
        )}
        {versionCount && (
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium">Total de Versões:</span>{" "}
            {versionCount}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <CalendarDays className="mr-1.5 h-4 w-4" />
          Atualizado em: {updatedAt}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/protocols/${id}`}>
            <Edit className="mr-1.5 h-4 w-4" />
            Ver / Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
