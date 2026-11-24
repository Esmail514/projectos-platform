import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tables: {
          include: { columns: true },
        },
      },
    });

    const paths: Record<string, any> = {};

    for (const proj of projects) {
      for (const table of proj.tables) {
        const basePath = `/api/v1/projects/${proj.id}/${table.name}`;

        paths[basePath] = {
          get: {
            tags: [proj.name],
            summary: `List all records from ${table.name}`,
            parameters: [
              { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
              { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
            ],
            responses: {
              200: { description: "Successful response" },
            },
          },
          post: {
            tags: [proj.name],
            summary: `Insert record into ${table.name}`,
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: table.columns.reduce((acc, col) => {
                      acc[col.name] = { type: col.type === "number" ? "number" : "string" };
                      return acc;
                    }, {} as any),
                  },
                },
              },
            },
            responses: {
              201: { description: "Record created successfully" },
            },
          },
          delete: {
            tags: [proj.name],
            summary: `Delete record from ${table.name}`,
            parameters: [
              { name: "id", in: "query", required: true, schema: { type: "string" } },
            ],
            responses: {
              200: { description: "Record deleted" },
            },
          },
        };
      }
    }

    const openApiSpec = {
      openapi: "3.0.0",
      info: {
        title: "ProjectOS Auto-Generated API Gateway",
        version: "1.0.0",
        description: "Dynamic OpenAPI 3.0 specification reflecting all provisioned projects, tables, and endpoints.",
      },
      paths,
    };

    return NextResponse.json(openApiSpec);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
