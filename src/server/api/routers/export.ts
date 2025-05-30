/**
 * tRPC Router for Document Export operations
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { generateProtocolDocx } from "@/lib/generators/docx";
import { generateJsPDFProtocolPdf } from "@/lib/generators/pdf-jspdf";
import { generateFlowchartSvg } from "@/lib/generators/svg";
import { sanitizeFilename } from "@/lib/generators/utils";
import {
  uploadToSupabaseStorage,
  createSupabaseSignedUrl,
} from "@/lib/supabase/storageActions";
import type { ProtocolFullContent } from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart"; // Use specific type

const ExportInputSchema = z.object({
  protocolId: z.string().min(1, "ID de protocolo inválido."),
  versionId: z.string().min(1, "ID de versão de protocolo inválido."),
  format: z.enum(["docx", "pdf", "svg"]),
});

export const exportRouter = router({
  exportProtocol: protectedProcedure
    .input(ExportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { protocolId, versionId, format } = input;

      const protocolVersion = await ctx.db.protocolVersion.findUnique({
        where: { id: versionId, protocolId: protocolId },
        include: { Protocol: true },
      });

      if (!protocolVersion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Versão de protocolo com ID '${versionId}' para o protocolo '${protocolId}' não encontrada.`,
        });
      }

      const protocolContent =
        protocolVersion.content as unknown as ProtocolFullContent;
      // Cast flowchart to FlowchartDefinition or undefined
      const flowchartData = protocolVersion.flowchart as unknown as
        | FlowchartDefinition
        | undefined;
      const protocolTitle = protocolVersion.Protocol.title || "protocolo";
      const protocolCode = protocolVersion.Protocol.code || "PROTO";
      const versionNum = protocolVersion.versionNumber;

      const safeBaseFilename = sanitizeFilename(
        `${protocolCode}_v${versionNum}_${protocolTitle}`,
      );
      const filename = `${safeBaseFilename}.${format}`;
      const filePathInBucket = `protocols/${protocolId}/${versionId}/${filename}`;

      let documentBody: Buffer | string;
      let contentType: string;

      switch (format) {
        case "docx":
          documentBody = await generateProtocolDocx(protocolContent);
          contentType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          break;
        case "pdf":
          // Use jsPDF generator
          documentBody = await generateJsPDFProtocolPdf(
            protocolContent,
            protocolTitle,
          );
          contentType = "application/pdf";
          break;
        case "svg":
          // Pass the correctly typed flowchartData
          documentBody = await generateFlowchartSvg(flowchartData);
          contentType = "image/svg+xml";
          break;
        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Formato de exportação '${format}' não suportado.`,
          });
      }

      const bufferToUpload = Buffer.isBuffer(documentBody)
        ? documentBody
        : Buffer.from(documentBody, "utf-8");

      try {
        await uploadToSupabaseStorage(
          filePathInBucket,
          bufferToUpload,
          contentType,
        );
        const downloadUrl = await createSupabaseSignedUrl(filePathInBucket);

        return {
          filename,
          url: downloadUrl,
          message: `Documento ${format.toUpperCase()} gerado e pronto para download via Supabase Storage.`,
        };
      } catch (error) {
        console.error(
          `Error during document export process (Supabase, format: ${format}):`,
          error,
        );
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha ao exportar o documento (${format.toUpperCase()}) para Supabase Storage: ${
            (error as Error).message
          }`,
          cause: error,
        });
      }
    }),
});
