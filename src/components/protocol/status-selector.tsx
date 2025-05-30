/**
 * Status Selector Component
 * Allows users to change protocol status with appropriate permissions
 */
import React, { useState } from "react";
import { ProtocolStatus, UserRole } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/api/client";
import { AlertCircle, CheckCircle, FileText, Archive } from "lucide-react";
import { toast } from "sonner";

interface StatusSelectorProps {
  protocolId: string;
  currentStatus: ProtocolStatus;
  userRole: UserRole;
  isCreator: boolean;
}

const statusConfig = {
  [ProtocolStatus.DRAFT]: {
    label: "Rascunho",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    icon: FileText,
    description: "Protocolo em desenvolvimento",
  },
  [ProtocolStatus.REVIEW]: {
    label: "Em Revisão",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: AlertCircle,
    description: "Aguardando aprovação",
  },
  [ProtocolStatus.APPROVED]: {
    label: "Aprovado",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
    description: "Pronto para uso",
  },
  [ProtocolStatus.ARCHIVED]: {
    label: "Arquivado",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: Archive,
    description: "Protocolo arquivado",
  },
};

export function StatusSelector({
  protocolId,
  currentStatus,
  userRole,
  isCreator,
}: StatusSelectorProps) {
  const [displayStatus, setDisplayStatus] =
    useState<ProtocolStatus>(currentStatus);
  const [selectedStatus, setSelectedStatus] =
    useState<ProtocolStatus>(currentStatus);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reason, setReason] = useState("");
  const utils = trpc.useUtils();

  // Update display status when currentStatus prop changes
  React.useEffect(() => {
    setDisplayStatus(currentStatus);
  }, [currentStatus]);

  const updateStatusMutation = trpc.protocol.updateStatus.useMutation({
    onSuccess: async (updatedProtocol) => {
      // Update local state immediately
      setDisplayStatus(updatedProtocol.status);
      toast.success("Status atualizado com sucesso!");
      setShowConfirmDialog(false);
      setReason("");

      // Invalidate queries to refresh data
      await utils.protocol.getById.invalidate({ protocolId });
      await utils.protocol.list.invalidate();
      await utils.protocol.getStats.invalidate();
      await utils.protocol.getRecentActivity.invalidate();

      // No need for router.refresh() since we're updating state locally
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  // Determinar quais transições de status são permitidas
  const getAllowedStatuses = (): ProtocolStatus[] => {
    const allowed: ProtocolStatus[] = [displayStatus];

    if (userRole === UserRole.ADMIN) {
      // Admin pode mudar para qualquer status
      return Object.values(ProtocolStatus);
    }

    switch (displayStatus) {
      case ProtocolStatus.DRAFT:
        // Criador pode enviar para revisão
        if (isCreator) {
          allowed.push(ProtocolStatus.REVIEW);
        }
        break;
      case ProtocolStatus.REVIEW:
        // Revisor pode aprovar ou devolver para rascunho
        if (userRole === UserRole.REVIEWER) {
          allowed.push(ProtocolStatus.APPROVED, ProtocolStatus.DRAFT);
        }
        break;
      case ProtocolStatus.APPROVED:
        // Apenas admin pode arquivar (já tratado acima)
        break;
    }

    return allowed;
  };

  const allowedStatuses = getAllowedStatuses();

  const handleStatusChange = (newStatus: ProtocolStatus) => {
    if (newStatus === displayStatus) return;

    setSelectedStatus(newStatus);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = () => {
    updateStatusMutation.mutate({
      protocolId,
      status: selectedStatus,
      reason: reason.trim() || undefined,
    });
  };

  const getConfirmationMessage = () => {
    const from = statusConfig[displayStatus].label;
    const to = statusConfig[selectedStatus].label;

    switch (selectedStatus) {
      case ProtocolStatus.REVIEW:
        return `Tem certeza que deseja enviar este protocolo para revisão?`;
      case ProtocolStatus.APPROVED:
        return `Tem certeza que deseja aprovar este protocolo? Ele estará disponível para uso.`;
      case ProtocolStatus.DRAFT:
        return `Tem certeza que deseja devolver este protocolo para rascunho? O criador precisará fazer ajustes.`;
      case ProtocolStatus.ARCHIVED:
        return `Tem certeza que deseja arquivar este protocolo? Ele não estará mais visível nas listagens.`;
      default:
        return `Tem certeza que deseja mudar o status de "${from}" para "${to}"?`;
    }
  };

  const StatusIcon = statusConfig[displayStatus].icon;

  return (
    <>
      <div className="flex items-center gap-2">
        <Label htmlFor="status-select" className="text-sm font-medium">
          Status:
        </Label>
        <Select
          value={displayStatus}
          onValueChange={(value) => handleStatusChange(value as ProtocolStatus)}
          disabled={allowedStatuses.length <= 1}
        >
          <SelectTrigger id="status-select" className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedStatuses.map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              return (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1 ${statusConfig[displayStatus].bgColor}`}
        >
          <StatusIcon
            className={`h-4 w-4 ${statusConfig[displayStatus].color}`}
          />
          <span className={`text-sm ${statusConfig[displayStatus].color}`}>
            {statusConfig[displayStatus].description}
          </span>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Mudança de Status</DialogTitle>
            <DialogDescription>{getConfirmationMessage()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-4">
              <div
                className={`rounded-lg p-3 ${statusConfig[displayStatus].bgColor}`}
              >
                <span
                  className={`font-medium ${statusConfig[displayStatus].color}`}
                >
                  {statusConfig[displayStatus].label}
                </span>
              </div>
              <span className="text-gray-500">→</span>
              <div
                className={`rounded-lg p-3 ${statusConfig[selectedStatus].bgColor}`}
              >
                <span
                  className={`font-medium ${statusConfig[selectedStatus].color}`}
                >
                  {statusConfig[selectedStatus].label}
                </span>
              </div>
            </div>

            {(selectedStatus === ProtocolStatus.DRAFT ||
              selectedStatus === ProtocolStatus.ARCHIVED) && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Motivo{" "}
                  {selectedStatus === ProtocolStatus.DRAFT
                    ? "da devolução"
                    : "do arquivamento"}{" "}
                  (opcional)
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo desta mudança..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Atualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
