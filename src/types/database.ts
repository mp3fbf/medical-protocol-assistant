/**
 * TypeScript Types for Medical Protocols Database
 *
 * This file contains the Supabase-generated types for the medical protocols database.
 * These types are used throughout the application for type safety.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      AuditLog: {
        Row: {
          action: string;
          details: Json | null;
          id: string;
          ipAddress: string | null;
          resourceId: string | null;
          resourceType: string | null;
          timestamp: string;
          userId: string | null;
        };
        Insert: {
          action: string;
          details?: Json | null;
          id: string;
          ipAddress?: string | null;
          resourceId?: string | null;
          resourceType?: string | null;
          timestamp?: string;
          userId?: string | null;
        };
        Update: {
          action?: string;
          details?: Json | null;
          id?: string;
          ipAddress?: string | null;
          resourceId?: string | null;
          resourceType?: string | null;
          timestamp?: string;
          userId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "AuditLog_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      Protocol: {
        Row: {
          code: string;
          condition: string;
          createdAt: string;
          createdById: string;
          id: string;
          status: Database["public"]["Enums"]["ProtocolStatus"];
          title: string;
          updatedAt: string;
        };
        Insert: {
          code: string;
          condition: string;
          createdAt?: string;
          createdById: string;
          id: string;
          status?: Database["public"]["Enums"]["ProtocolStatus"];
          title: string;
          updatedAt: string;
        };
        Update: {
          code?: string;
          condition?: string;
          createdAt?: string;
          createdById?: string;
          id?: string;
          status?: Database["public"]["Enums"]["ProtocolStatus"];
          title?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Protocol_createdById_fkey";
            columns: ["createdById"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      ProtocolVersion: {
        Row: {
          changelogNotes: string | null;
          content: Json;
          createdAt: string;
          createdById: string;
          flowchart: Json;
          id: string;
          protocolId: string;
          versionNumber: number;
        };
        Insert: {
          changelogNotes?: string | null;
          content: Json;
          createdAt?: string;
          createdById: string;
          flowchart: Json;
          id: string;
          protocolId: string;
          versionNumber: number;
        };
        Update: {
          changelogNotes?: string | null;
          content?: Json;
          createdAt?: string;
          createdById?: string;
          flowchart?: Json;
          id?: string;
          protocolId?: string;
          versionNumber?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ProtocolVersion_createdById_fkey";
            columns: ["createdById"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ProtocolVersion_protocolId_fkey";
            columns: ["protocolId"];
            isOneToOne: false;
            referencedRelation: "Protocol";
            referencedColumns: ["id"];
          },
        ];
      };
      User: {
        Row: {
          createdAt: string;
          email: string;
          id: string;
          name: string;
          role: Database["public"]["Enums"]["UserRole"];
          updatedAt: string;
        };
        Insert: {
          createdAt?: string;
          email: string;
          id: string;
          name: string;
          role?: Database["public"]["Enums"]["UserRole"];
          updatedAt: string;
        };
        Update: {
          createdAt?: string;
          email?: string;
          id?: string;
          name?: string;
          role?: Database["public"]["Enums"]["UserRole"];
          updatedAt?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      ProtocolStatus: "DRAFT" | "REVIEW" | "APPROVED" | "ARCHIVED";
      UserRole: "CREATOR" | "REVIEWER" | "ADMIN";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience types for easier usage
export type Protocol = Database["public"]["Tables"]["Protocol"]["Row"];
export type ProtocolInsert = Database["public"]["Tables"]["Protocol"]["Insert"];
export type ProtocolUpdate = Database["public"]["Tables"]["Protocol"]["Update"];

export type ProtocolVersion =
  Database["public"]["Tables"]["ProtocolVersion"]["Row"];
export type ProtocolVersionInsert =
  Database["public"]["Tables"]["ProtocolVersion"]["Insert"];
export type ProtocolVersionUpdate =
  Database["public"]["Tables"]["ProtocolVersion"]["Update"];

export type User = Database["public"]["Tables"]["User"]["Row"];
export type UserInsert = Database["public"]["Tables"]["User"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["User"]["Update"];

export type AuditLog = Database["public"]["Tables"]["AuditLog"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["AuditLog"]["Insert"];
export type AuditLogUpdate = Database["public"]["Tables"]["AuditLog"]["Update"];

export type ProtocolStatus = Database["public"]["Enums"]["ProtocolStatus"];
export type UserRole = Database["public"]["Enums"]["UserRole"];

// JsonValue type for compatibility
export type JsonValue = Json;
