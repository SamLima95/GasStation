import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createEntregadorSchema } from "./application/dtos/create-entregador.dto";
import { entregadorResponseDtoSchema } from "./application/dtos/entregador-response.dto";
import { createVeiculoSchema } from "./application/dtos/create-veiculo.dto";
import { veiculoResponseDtoSchema } from "./application/dtos/veiculo-response.dto";
import { createRotaSchema } from "./application/dtos/create-rota.dto";
import { rotaResponseDtoSchema } from "./application/dtos/rota-response.dto";
import { entregaResponseDtoSchema } from "./application/dtos/entrega-response.dto";

extendZodWithOpenApi(z);
const Err = z.object({ error: z.string(), message: z.string() }).openapi("Error");
const registry = new OpenAPIRegistry();

registry.registerPath({ method: "get", path: "/api/entregadores", summary: "Listar entregadores", tags: ["Entregadores"], security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista", content: { "application/json": { schema: z.array(entregadorResponseDtoSchema.openapi("EntregadorResponse")) } } } } });
registry.registerPath({ method: "post", path: "/api/entregadores", summary: "Criar entregador", tags: ["Entregadores"], security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: createEntregadorSchema.openapi("CreateEntregadorBody") } } } },
  responses: { 201: { description: "Criado", content: { "application/json": { schema: entregadorResponseDtoSchema } } } } });

registry.registerPath({ method: "get", path: "/api/veiculos", summary: "Listar veiculos", tags: ["Veiculos"], security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista", content: { "application/json": { schema: z.array(veiculoResponseDtoSchema.openapi("VeiculoResponse")) } } } } });
registry.registerPath({ method: "post", path: "/api/veiculos", summary: "Criar veiculo", tags: ["Veiculos"], security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: createVeiculoSchema.openapi("CreateVeiculoBody") } } } },
  responses: { 201: { description: "Criado", content: { "application/json": { schema: veiculoResponseDtoSchema } } } } });

registry.registerPath({ method: "get", path: "/api/rotas", summary: "Listar rotas", tags: ["Rotas"], security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista", content: { "application/json": { schema: z.array(rotaResponseDtoSchema.openapi("RotaResponse")) } } } } });
registry.registerPath({ method: "post", path: "/api/rotas", summary: "Criar rota", tags: ["Rotas"], security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: createRotaSchema.openapi("CreateRotaBody") } } } },
  responses: { 201: { description: "Criada", content: { "application/json": { schema: rotaResponseDtoSchema } } } } });

registry.registerPath({ method: "get", path: "/api/entregas", summary: "Listar entregas", tags: ["Entregas"], security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista", content: { "application/json": { schema: z.array(entregaResponseDtoSchema.openapi("EntregaResponse")) } } } } });
registry.registerPath({ method: "patch", path: "/api/entregas/{id}/assign", summary: "Atribuir entrega a rota", tags: ["Entregas"], security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: "Atribuida", content: { "application/json": { schema: entregaResponseDtoSchema } } } } });
registry.registerPath({ method: "patch", path: "/api/entregas/{id}/confirm", summary: "Confirmar entrega", tags: ["Entregas"], security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: "Confirmada", content: { "application/json": { schema: entregaResponseDtoSchema } } } } });

export function createLogisticsOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3", info: { title: "Logistics Service API", version: "1.0.0", description: "Gestao de entregadores, veiculos, rotas e entregas. Todas as rotas exigem JWT." },
    servers: [{ url: serverUrl }],
  });
  const d = doc as { components?: { securitySchemes?: object } };
  if (d.components) d.components.securitySchemes = { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } };
  return doc;
}
