import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { auditoriaResponseDtoSchema } from "./application/dtos/auditoria.dto";

extendZodWithOpenApi(z);

const AuditoriaResponseSchema = auditoriaResponseDtoSchema.openapi("AuditoriaResponse");
const ErrorSchema = z.object({ error: z.string() }).openapi("Error");

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/api/auditoria",
  summary: "Consultar trilha de auditoria com filtros",
  tags: ["Auditoria"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      servico: z.string().optional(),
      entidade: z.string().optional(),
      entidadeId: z.string().optional(),
      acao: z.string().optional(),
      usuarioId: z.string().optional(),
      unidadeId: z.string().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }),
  },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.array(AuditoriaResponseSchema) } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export function createAuditOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Audit Service API", version: "1.0.0", description: "Trilha de auditoria imutável — consulta de registros." },
    servers: [{ url: serverUrl }],
  });
  const docObj = doc as { components?: { securitySchemes?: object } };
  if (docObj.components) {
    docObj.components.securitySchemes = {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Token JWT do identity-service" },
    };
  }
  return doc;
}
