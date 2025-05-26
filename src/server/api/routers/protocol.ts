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
  UpdateProtocolInputSchema,
  UpdateProtocolVersionInputSchema,
} from "@/lib/validators/protocol-schema";
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import { ProtocolStatus, UserRole } from "@prisma/client";
import { Permission } from "@/lib/auth/permissions";
import { checkPermission } from "@/lib/auth/rbac";

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

      // Basic permission check (more granular checks can be added if needed)
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

      // Generate a unique protocol code (e.g., based on condition and count)
      // For simplicity, using a placeholder logic.
      const codePrefix = condition.substring(0, 5).toUpperCase();
      const count = await ctx.db.protocol.count({
        where: { code: { startsWith: codePrefix } },
      });
      const protocolCode = `${codePrefix}-${(count + 1)
        .toString()
        .padStart(3, "0")}`;

      const protocol = await ctx.db.protocol.create({
        data: {
          title,
          condition,
          code: protocolCode,
          createdById: userId,
          status: ProtocolStatus.DRAFT,
          versions: {
            create: [
              {
                versionNumber: 1,
                createdById: userId,
                content: DEFAULT_EMPTY_CONTENT as any,
                flowchart: DEFAULT_EMPTY_FLOWCHART as any,
                changelogNotes: "Versão inicial criada.",
              },
            ],
          },
        },
        include: {
          versions: true, // Include the created version
        },
      });
      return protocol;
    }),

  /**
   * Lists protocols with pagination and filtering.
   */
  list: publicProcedure // Or protectedProcedure if all lists require auth
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
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { versions: true },
          },
          // Optionally include latest version summary
          versions: {
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

  /**
   * Retrieves a single protocol by its ID, including all its versions and details.
   */
  getById: protectedProcedure
    .input(ProtocolIdInputSchema)
    .query(async ({ ctx, input }) => {
      const protocol = await ctx.db.protocol.findUnique({
        where: { id: input.protocolId },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          versions: {
            orderBy: { versionNumber: "desc" }, // Get all versions, newest first
            include: {
              createdBy: {
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

  /**
   * Updates a protocol's metadata or creates a new version.
   */
  update: protectedProcedure
    .input(UpdateProtocolVersionInputSchema) // Using a schema that allows content/flowchart update
    .mutation(async ({ ctx, input }) => {
      const { protocolId, content, flowchart, changelogNotes } = input;
      const userId = ctx.session.user.id;

      const protocol = await ctx.db.protocol.findUnique({
        where: { id: protocolId },
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      });

      if (!protocol) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Protocolo com ID '${protocolId}' não encontrado.`,
        });
      }

      // Permission check: Can edit own or any (if applicable)
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

      const latestVersionNumber = protocol.versions[0]?.versionNumber ?? 0;

      // Create a new version for content/flowchart updates
      await ctx.db.protocol.update({
        where: { id: protocolId },
        data: {
          updatedAt: new Date(), // Ensure updatedAt is updated
          versions: {
            create: {
              versionNumber: latestVersionNumber + 1,
              content: (content ?? DEFAULT_EMPTY_CONTENT) as any,
              flowchart: (flowchart ?? DEFAULT_EMPTY_FLOWCHART) as any,
              changelogNotes:
                changelogNotes ??
                `Atualização para versão ${latestVersionNumber + 1}.`,
              createdById: userId,
            },
          },
        },
      });

      // Fetch the newly created version
      const newVersion = await ctx.db.protocolVersion.findFirst({
        where: {
          protocolId: protocolId,
          versionNumber: latestVersionNumber + 1,
        },
      });

      return newVersion;
    }),

  // TODO: delete: protectedProcedure...
});

export const protocolCaller = createCallerFactory(protocolRouter);
