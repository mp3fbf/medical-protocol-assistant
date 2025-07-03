/**
 * API Integration Tests for tRPC Endpoints
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { appRouter } from "@/server/api/root";
import type { Context } from "@/server/api/context";
import type { Session } from "next-auth";
import { prisma } from "@/lib/db/client";
import { ProtocolStatus, UserRole, type Protocol } from "@prisma/client";
import { AuditActions } from "@/lib/audit";
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";

const mockUser = {
  id: "test-audit-user-id",
  name: "Audit Test User",
  email: "audit@example.com",
  role: UserRole.ADMIN, // Admin to ensure permissions for create/update
  hashedPassword: "hashedpasswordplaceholder", // Required by schema
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession: Session = {
  user: { ...mockUser },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const createMockContext = (session?: Session | null): Context => ({
  session: session === undefined ? mockSession : session,
  db: prisma,
  req: new Request("http://localhost"),
  resHeaders: new Headers(),
  info: {
    isBatchCall: false,
    calls: [],
    type: "query",
    accept: "application/jsonl",
    connectionParams: null,
    signal: new AbortController().signal,
    url: new URL("http://localhost/api/trpc/healthCheck"),
  },
});

// Create a caller for the appRouter
const caller = appRouter.createCaller(createMockContext());

describe("API Router - Protocol Management & Audit Logging", () => {
  let createdProtocolId: string | undefined;
  let createdAdminUserId: string;

  beforeEach(async () => {
    // Ensure mock user exists for createdById fields
    const user = await prisma.user.upsert({
      where: { email: mockUser.email },
      update: {},
      create: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        hashedPassword: mockUser.hashedPassword,
      },
    });
    createdAdminUserId = user.id;
  });

  afterEach(async () => {
    // Clean up created test data
    if (createdProtocolId) {
      await prisma.protocolVersion.deleteMany({
        where: { protocolId: createdProtocolId },
      });
      await prisma.protocol.deleteMany({ where: { id: createdProtocolId } });
    }
    await prisma.auditLog.deleteMany({ where: { userId: createdAdminUserId } });
    createdProtocolId = undefined;
  });

  it("should create an audit log entry on protocol creation", async () => {
    const protocolInput = {
      title: "Audit Log Test Protocol",
      condition: "Logging Condition",
    };

    const createdProtocol = await caller.protocol.create(protocolInput);
    createdProtocolId = createdProtocol.id; // For cleanup

    expect(createdProtocol).toBeDefined();
    expect(createdProtocol.title).toBe(protocolInput.title);

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: AuditActions.PROTOCOL_CREATE,
        resourceType: "Protocol",
        resourceId: createdProtocol.id,
        userId: mockSession.user.id,
      },
    });
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].details).toEqual(
      expect.objectContaining({
        title: protocolInput.title,
        code: createdProtocol.code,
      }),
    );
  });

  it("should create an audit log entry on protocol version update", async () => {
    // First, create a protocol to update
    const initialProtocol = await caller.protocol.create({
      title: "Version Audit Test",
      condition: "Versioning Test",
    });
    createdProtocolId = initialProtocol.id; // For cleanup

    const DEFAULT_EMPTY_CONTENT_TEST: ProtocolFullContent = Object.fromEntries(
      Array.from({ length: 13 }, (_, i) => [
        (i + 1).toString(),
        {
          sectionNumber: i + 1,
          title: `Seção ${i + 1}`,
          content: `Conteúdo seção ${i + 1}`,
        },
      ]),
    );
    const DEFAULT_EMPTY_FLOWCHART_TEST: {
      nodes: Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        data?: any;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
        label?: string;
      }>;
      layout?: any;
    } = { nodes: [], edges: [] };

    const updateInput = {
      protocolId: initialProtocol.id,
      content: DEFAULT_EMPTY_CONTENT_TEST,
      flowchart: DEFAULT_EMPTY_FLOWCHART_TEST,
      changelogNotes: "Updated content for audit test",
    };

    const updatedVersion = await caller.protocol.update(updateInput);
    expect(updatedVersion).toBeDefined();
    expect(updatedVersion.versionNumber).toBe(2); // Initial is 1, update creates 2

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: AuditActions.PROTOCOL_VERSION_CREATE,
        resourceType: "ProtocolVersion",
        resourceId: updatedVersion.id,
        userId: mockSession.user.id,
      },
      orderBy: { timestamp: "desc" }, // Get the latest one if multiple updates happen fast
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(1); // Can be >1 if create also made a version_create log

    const specificLog = auditLogs.find(
      (log) => (log.details as any)?.newVersionNumber === 2,
    );
    expect(specificLog).toBeDefined();
    expect(specificLog?.details).toEqual(
      expect.objectContaining({
        changelog: updateInput.changelogNotes,
        protocolId: initialProtocol.id,
        protocolCode: initialProtocol.code,
        newVersionNumber: 2,
      }),
    );
  });

  // Test other protocol router endpoints as needed
});

describe("API Router - Health Check", () => {
  it("should return status ok from healthCheck endpoint for unauthenticated user", async () => {
    const localCaller = appRouter.createCaller(createMockContext(null));
    const result = await localCaller.healthCheck();

    expect(result.status).toBe("ok");
    expect(result.isAuthenticated).toBe(false);
    expect(result.timestamp).toBeTypeOf("string");
  });

  it("should return status ok and authenticated true from healthCheck for authenticated user", async () => {
    const localCaller = appRouter.createCaller(createMockContext(mockSession));
    const result = await localCaller.healthCheck();

    expect(result.status).toBe("ok");
    expect(result.isAuthenticated).toBe(true);
    expect(result.timestamp).toBeTypeOf("string");
  });
});
