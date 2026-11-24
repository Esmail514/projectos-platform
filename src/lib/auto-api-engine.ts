import { prisma } from "./db";

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  filter?: Record<string, any>;
}

export async function executeAutoAPI(
  projectId: string,
  tableName: string,
  action: "LIST" | "GET" | "CREATE" | "UPDATE" | "DELETE",
  options: {
    recordId?: string;
    payload?: Record<string, any>;
    queryOptions?: QueryOptions;
  } = {}
) {
  const startTime = performance.now();

  // Find project and table schema
  const table = await prisma.tableSchema.findFirst({
    where: {
      projectId,
      name: tableName,
    },
    include: {
      columns: true,
    },
  });

  if (!table) {
    throw new Error(`Table '${tableName}' not found in project '${projectId}'`);
  }

  let result: any = null;

  switch (action) {
    case "LIST": {
      const { limit = 50, offset = 0 } = options.queryOptions || {};
      const rows = await prisma.recordRow.findMany({
        where: { tableId: table.id },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      result = {
        table: table.name,
        total: await prisma.recordRow.count({ where: { tableId: table.id } }),
        data: rows.map((r) => ({
          id: r.id,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          ...JSON.parse(r.data),
        })),
      };
      break;
    }

    case "GET": {
      if (!options.recordId) throw new Error("recordId is required for GET");
      const row = await prisma.recordRow.findUnique({
        where: { id: options.recordId },
      });
      if (!row) throw new Error("Record not found");
      result = {
        id: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        ...JSON.parse(row.data),
      };
      break;
    }

    case "CREATE": {
      const dataPayload = options.payload || {};
      // Validate columns
      for (const col of table.columns) {
        if (col.isRequired && dataPayload[col.name] === undefined) {
          throw new Error(`Column '${col.name}' is required`);
        }
      }

      const newRow = await prisma.recordRow.create({
        data: {
          tableId: table.id,
          data: JSON.stringify(dataPayload),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          projectId,
          action: "RECORD_CREATE",
          target: `${tableName}:${newRow.id}`,
          details: JSON.stringify(dataPayload),
        },
      });

      result = {
        id: newRow.id,
        createdAt: newRow.createdAt,
        ...dataPayload,
      };
      break;
    }

    case "UPDATE": {
      if (!options.recordId) throw new Error("recordId is required for UPDATE");
      const existing = await prisma.recordRow.findUnique({
        where: { id: options.recordId },
      });
      if (!existing) throw new Error("Record not found");

      const existingData = JSON.parse(existing.data);
      const mergedData = { ...existingData, ...options.payload };

      const updated = await prisma.recordRow.update({
        where: { id: options.recordId },
        data: {
          data: JSON.stringify(mergedData),
        },
      });

      result = {
        id: updated.id,
        updatedAt: updated.updatedAt,
        ...mergedData,
      };
      break;
    }

    case "DELETE": {
      if (!options.recordId) throw new Error("recordId is required for DELETE");
      await prisma.recordRow.delete({
        where: { id: options.recordId },
      });

      await prisma.auditLog.create({
        data: {
          projectId,
          action: "RECORD_DELETE",
          target: `${tableName}:${options.recordId}`,
        },
      });

      result = { success: true, id: options.recordId };
      break;
    }
  }

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  // Record Telemetry
  try {
    await prisma.telemetryEvent.create({
      data: {
        path: `/api/v1/projects/${projectId}/${tableName}`,
        method: action,
        statusCode: 200,
        durationMs,
      },
    });
  } catch {}

  return { ...result, _meta: { durationMs } };
}
