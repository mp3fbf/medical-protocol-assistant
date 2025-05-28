/**
 * tRPC Router for Protocol Management
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  router,
  publicProcedure,
  protectedProcedure,
  createCallerFactory,
} from "../trpc";
import {
  CreateProtocolInputSchema,
  ListProtocolsInputSchema,
  ProtocolIdInputSchema,
  // UpdateProtocolInputSchema, // Not used directly in this version of update
  UpdateProtocolVersionInputSchema,
} from "@/lib/validators/protocol-schema";
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import { ProtocolStatus, UserRole } from "@prisma/client";
import { Permission } from "@/lib/auth/permissions";
import { checkPermission } from "@/lib/auth/rbac";
import { randomUUID } from "crypto"; // Use crypto.randomUUID

const DEFAULT_EMPTY_CONTENT: ProtocolFullContent = Object.fromEntries(
  Array.from({ length: 13 }, (_, i) => [
    (i + 1).toString(),
    {
      sectionNumber: i + 1,
      title: `Seção ${i + 1}`, // Placeholder title
      content: "", // Default empty content
    },
  ]),
);

const DEFAULT_EMPTY_FLOWCHART: FlowchartData = {
  nodes: [],
  edges: [],
  // viewport can be omitted or set to a default if needed
};

export const protocolRouter = router({
  /**
   * Creates a new medical protocol.
   * Initializes with a first version containing empty content for 13 sections.
   */
  create: protectedProcedure
    .input(CreateProtocolInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, condition } = input;
      const userId = ctx.session.user.id;

      if (
        !checkPermission(
          ctx.session.user.role as UserRole,
          Permission.CREATE_PROTOCOL,
        )
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para criar protocolos.",
        });
      }

      const codePrefix = condition.substring(0, 5).toUpperCase();
      const count = await ctx.db.protocol.count({
        where: { code: { startsWith: codePrefix } },
      });
      const protocolCode = `${codePrefix}-${(count + 1)
        .toString()
        .padStart(3, "0")}`;

      const protocol = await ctx.db.protocol.create({
        data: {
          id: randomUUID(),
          title,
          condition,
          code: protocolCode,
          createdById: userId,
          status: ProtocolStatus.DRAFT,
          updatedAt: new Date(), // Explicitly set updatedAt
          ProtocolVersion: {
            create: [
              {
                id: randomUUID(),
                versionNumber: 1,
                createdById: userId,
                content: DEFAULT_EMPTY_CONTENT as any, // Prisma expects JsonValue
                flowchart: DEFAULT_EMPTY_FLOWCHART as any, // Prisma expects JsonValue
                changelogNotes: "Versão inicial criada.",
              },
            ],
          },
        },
        include: {
          ProtocolVersion: true,
        },
      });
      return protocol;
    }),

  list: publicProcedure
    .input(ListProtocolsInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sortBy = "updatedAt",
        sortOrder = "desc",
      } = input;

      const whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { condition: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ];
      }

      const protocols = await ctx.db.protocol.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { ProtocolVersion: true },
          },
          ProtocolVersion: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            select: { versionNumber: true, createdAt: true },
          },
        },
      });

      const totalProtocols = await ctx.db.protocol.count({
        where: whereClause,
      });

      return {
        items: protocols,
        totalItems: totalProtocols,
        totalPages: Math.ceil(totalProtocols / limit),
        currentPage: page,
      };
    }),

  getById: protectedProcedure
    .input(ProtocolIdInputSchema)
    .query(async ({ ctx, input }) => {
      const protocol = await ctx.db.protocol.findUnique({
        where: { id: input.protocolId },
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          ProtocolVersion: {
            orderBy: { versionNumber: "desc" },
            include: {
              User: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!protocol) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Protocolo com ID '${input.protocolId}' não encontrado.`,
        });
      }
      return protocol;
    }),

  update: protectedProcedure
    .input(UpdateProtocolVersionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { protocolId, content, flowchart, changelogNotes } = input;
      const userId = ctx.session.user.id;

      const protocol = await ctx.db.protocol.findUnique({
        where: { id: protocolId },
        include: {
          ProtocolVersion: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      });

      if (!protocol) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Protocolo com ID '${protocolId}' não encontrado.`,
        });
      }

      const canEditOwn = checkPermission(
        ctx.session.user.role as UserRole,
        Permission.EDIT_OWN_PROTOCOL,
        protocol.createdById,
        userId,
      );
      const canEditAny = checkPermission(
        ctx.session.user.role as UserRole,
        Permission.EDIT_ANY_PROTOCOL,
      );

      if (!canEditOwn && !canEditAny) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar este protocolo.",
        });
      }

      const latestVersionNumber =
        protocol.ProtocolVersion[0]?.versionNumber ?? 0;

      const newProtocolVersion = await ctx.db.protocolVersion.create({
        data: {
          id: randomUUID(),
          protocolId: protocolId,
          versionNumber: latestVersionNumber + 1,
          content: (content ??
            protocol.ProtocolVersion[0]?.content ??
            DEFAULT_EMPTY_CONTENT) as any, // Prisma expects JsonValue
          flowchart: (flowchart ??
            protocol.ProtocolVersion[0]?.flowchart ??
            DEFAULT_EMPTY_FLOWCHART) as any, // Prisma expects JsonValue
          changelogNotes:
            changelogNotes ??
            `Atualização para versão ${latestVersionNumber + 1}.`,
          createdById: userId,
        },
      });

      await ctx.db.protocol.update({
        where: { id: protocolId },
        data: {
          updatedAt: new Date(),
        },
      });

      return newProtocolVersion;
    }),
});

export const protocolCaller = createCallerFactory(protocolRouter);
