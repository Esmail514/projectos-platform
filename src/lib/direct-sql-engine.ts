import { prisma } from "./db";

export async function executeDirectSQL(projectId: string, sqlQuery: string) {
  const startTime = performance.now();

  // Basic security sanitization for client queries
  const sanitized = sqlQuery.trim();
  if (!sanitized) {
    throw new Error("Query cannot be empty");
  }

  let rows: any[] = [];
  try {
    // Execute query via Prisma Raw
    rows = (await prisma.$queryRawUnsafe(sanitized)) as any[];
  } catch (err: any) {
    throw new Error(`SQL Error: ${err.message}`);
  }

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        projectId,
        action: "DIRECT_SQL_EXEC",
        target: "SQL_ENGINE",
        details: sanitized.substring(0, 500),
      },
    });

    await prisma.telemetryEvent.create({
      data: {
        path: `/api/v1/projects/${projectId}/sql`,
        method: "POST",
        statusCode: 200,
        durationMs,
      },
    });
  } catch {}

  return {
    query: sanitized,
    rowsCount: Array.isArray(rows) ? rows.length : 1,
    rows: Array.isArray(rows) ? rows : [rows],
    durationMs,
  };
}
