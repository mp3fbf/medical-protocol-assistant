/**
 * Supabase Storage Actions
 *
 * This module provides functions for common Supabase Storage operations like
 * uploading files and generating signed URLs.
 */
import { getSupabaseAdminClient } from "./client";
import { TRPCError } from "@trpc/server";

const PROTOCOL_DOCUMENTS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_NAME || "protocol-documents"; // Default bucket name
const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour in seconds

/**
 * Uploads a file buffer to Supabase Storage.
 * @param filePathInBucket - The path (including filename) where the file will be stored in the bucket.
 * @param body - The file content as a Buffer or ArrayBuffer.
 * @param contentType - The MIME type of the file.
 * @returns The Supabase storage file object data on success.
 * @throws {TRPCError} If the upload fails or bucket name is not configured.
 */
export async function uploadToSupabaseStorage(
  filePathInBucket: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
) {
  if (!PROTOCOL_DOCUMENTS_BUCKET) {
    console.error("SUPABASE_STORAGE_BUCKET_NAME is not configured.");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Bucket de armazenamento não configurado.",
    });
  }

  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(PROTOCOL_DOCUMENTS_BUCKET)
    .upload(filePathInBucket, body, {
      contentType,
      upsert: true, // Overwrite if file already exists
    });

  if (error) {
    console.error(
      `Error uploading ${filePathInBucket} to Supabase Storage:`,
      error,
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Falha no upload para o Supabase Storage: ${error.message}`,
      cause: error,
    });
  }

  console.log(
    `Successfully uploaded ${filePathInBucket} to Supabase bucket ${PROTOCOL_DOCUMENTS_BUCKET}.`,
  );
  return data;
}

/**
 * Generates a signed URL for downloading an object from Supabase Storage.
 * @param filePathInBucket - The path (including filename) of the file in the bucket.
 * @param expiresIn - Duration in seconds for which the URL will be valid. Defaults to SIGNED_URL_EXPIRES_IN.
 * @returns A promise resolving to the signed URL string.
 * @throws {TRPCError} If URL generation fails or bucket name is not configured.
 */
export async function createSupabaseSignedUrl(
  filePathInBucket: string,
  expiresIn: number = SIGNED_URL_EXPIRES_IN,
): Promise<string> {
  if (!PROTOCOL_DOCUMENTS_BUCKET) {
    console.error("SUPABASE_STORAGE_BUCKET_NAME is not configured.");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Bucket de armazenamento não configurado.",
    });
  }
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(PROTOCOL_DOCUMENTS_BUCKET)
    .createSignedUrl(filePathInBucket, expiresIn);

  if (error) {
    console.error(
      `Error generating signed URL for ${filePathInBucket}:`,
      error,
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Falha ao gerar URL assinada do Supabase Storage: ${error.message}`,
      cause: error,
    });
  }

  if (!data?.signedUrl) {
    console.error(
      `Supabase createSignedUrl returned no URL for ${filePathInBucket}`,
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível obter a URL assinada do Supabase Storage.",
    });
  }

  console.log(`Generated signed URL for ${filePathInBucket}.`);
  return data.signedUrl;
}
