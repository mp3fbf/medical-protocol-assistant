/**
 * tRPC Router for Document Export operations
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { generateProtocolDocx } from "@/lib/generators/docx"; // Assumed to exist from previous Step 13 work
import {
  uploadToSupabaseStorage,
  createSupabaseSignedUrl,
} from "@/lib/supabase/storageActions";
import type { ProtocolFullContent } from "@/types/protocol";

const ExportInputSchema = z.object({
  protocolId: z.string().uuid("ID de protocolo inválido."),
  versionId: z.string().uuid("ID de versão de protocolo inválido."),
  format: z.enum(["docx"]), // Extend with "pdf", "svg" later
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
        protocolVersion.content as unknown as ProtocolFullContent; // Prisma returns JsonValue
      const protocolTitle = protocolVersion.Protocol.title || "protocolo";
      const protocolCode = protocolVersion.Protocol.code || "PROTO";
      const versionNum = protocolVersion.versionNumber;

      // Sanitize title for use in filename
      const safeTitle = protocolTitle
        .replace(/[^a-z0-9\s-]/gi, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
      const filename = `${protocolCode}_v${versionNum}_${safeTitle}.${format}`;
      // Define a path within the Supabase bucket
      const filePathInBucket = `protocols/${protocolId}/${versionId}/${filename}`;

      let documentBuffer: Buffer;
      let contentType: string;

      switch (format) {
        case "docx":
          documentBuffer = await generateProtocolDocx(protocolContent);
          contentType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          break;
        // Add cases for PDF, SVG later
        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Formato de exportação '${format}' não suportado.`,
          });
      }

      try {
        // Upload to Supabase Storage
        await uploadToSupabaseStorage(
          filePathInBucket,
          documentBuffer,
          contentType,
        );

        // Get signed URL for download from Supabase Storage
        const downloadUrl = await createSupabaseSignedUrl(filePathInBucket);

        return {
          filename,
          url: downloadUrl,
          message: `Documento ${format.toUpperCase()} gerado e pronto para download via Supabase Storage.`,
        };
      } catch (error) {
        console.error(
          "Error during document export process (Supabase):",
          error,
        );
        if (error instanceof TRPCError) throw error; // Re-throw TRPCError as is
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha ao exportar o documento para Supabase Storage: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),
});
