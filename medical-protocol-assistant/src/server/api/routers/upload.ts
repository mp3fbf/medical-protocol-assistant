/**
 * tRPC Router for Document Upload and Processing
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { documentParser } from "@/lib/upload/document-parser";
import type { ParsedDocument } from "@/lib/upload/document-parser";
import { TRPCError } from "@trpc/server";

const DocumentUploadInputSchema = z.object({
  fileName: z.string(),
  fileBuffer: z.string(), // Base64 encoded file content
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB limit
  mimeType: z.string(),
});

const BulkDocumentUploadInputSchema = z.object({
  files: z.array(DocumentUploadInputSchema).max(3),
});

export const uploadRouter = router({
  processDocument: protectedProcedure
    .input(DocumentUploadInputSchema)
    .mutation(async ({ ctx, input }): Promise<ParsedDocument> => {
      console.log(
        `User ${ctx.session.user.id} uploading document: ${input.fileName}`,
      );

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileBuffer, "base64");

        // Validate file size
        if (buffer.length !== input.fileSize) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size mismatch",
          });
        }

        // Parse the document
        const parsedDocument = await documentParser.parseFile(
          buffer,
          input.fileName,
        );

        console.log(
          `Successfully parsed document: ${input.fileName}, extracted ${parsedDocument.content.length} characters`,
        );

        return parsedDocument;
      } catch (error: any) {
        console.error("Document processing failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to process document: ${error.message}`,
        });
      }
    }),

  processBulkDocuments: protectedProcedure
    .input(BulkDocumentUploadInputSchema)
    .mutation(async ({ ctx, input }): Promise<ParsedDocument[]> => {
      console.log(
        `User ${ctx.session.user.id} uploading ${input.files.length} documents`,
      );

      const results: ParsedDocument[] = [];

      for (const file of input.files) {
        try {
          const buffer = Buffer.from(file.fileBuffer, "base64");
          const parsedDocument = await documentParser.parseFile(
            buffer,
            file.fileName,
          );
          results.push(parsedDocument);
        } catch (error: any) {
          console.error(`Failed to parse ${file.fileName}:`, error);
          // For bulk upload, we continue with other files but track errors
          results.push({
            content: "",
            metadata: {
              fileType: file.mimeType,
              fileName: file.fileName,
              fileSize: file.fileSize,
              extractedAt: new Date(),
            },
          });
        }
      }

      return results;
    }),

  // Get supported file types
  getSupportedFileTypes: protectedProcedure.query(() => {
    return {
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "text/plain": [".txt"],
      },
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
    };
  }),
});
