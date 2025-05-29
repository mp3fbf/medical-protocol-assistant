/**
 * File Upload Component
 * Drag and drop file upload with preview
 */
"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  Upload,
  File,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesSelected?: (files: File[]) => void;
  onFileRemove?: (fileIndex: number) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

export function FileUpload({
  accept = DEFAULT_ACCEPT,
  maxFiles = 3,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesSelected,
  onFileRemove,
  disabled = false,
  className,
  children,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        console.warn("Rejected files:", rejectedFiles);
      }

      // Add accepted files
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        status: "pending" as const,
      }));

      setUploadedFiles((prev) => {
        const combined = [...prev, ...newFiles];
        // Respect maxFiles limit
        const limited = combined.slice(0, maxFiles);
        return limited;
      });
    },
    [maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple: maxFiles > 1,
  });

  // Notify parent when files change
  useEffect(() => {
    if (onFilesSelected) {
      onFilesSelected(uploadedFiles.map((f) => f.file));
    }
  }, [uploadedFiles, onFilesSelected]); // onFilesSelected should be memoized in parent

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });

    if (onFileRemove) {
      onFileRemove(index);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    switch (extension) {
      case "pdf":
        return <File className="h-4 w-4 text-red-500" />;
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "txt":
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "cursor-pointer border-2 border-dashed transition-colors",
          isDragActive && "border-blue-400 bg-blue-50 dark:bg-blue-950/10",
          disabled && "cursor-not-allowed opacity-50",
          !isDragActive && "border-gray-300 hover:border-gray-400",
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <input {...getInputProps()} />

          {children ? (
            children
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isDragActive
                  ? "Solte os arquivos aqui..."
                  : "Arraste arquivos ou clique para selecionar"}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Suporta PDF, DOCX e TXT (máx. {formatFileSize(maxSize)})
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Arquivos selecionados ({uploadedFiles.length})
          </h4>

          {uploadedFiles.map((uploadedFile, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadedFile.file.name)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Icon */}
                  {uploadedFile.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {uploadedFile.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadedFile.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
