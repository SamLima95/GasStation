import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createVasilhameSchema } from "./application/dtos/create-vasilhame.dto";
import { vasilhameResponseDtoSchema } from "./application/dtos/vasilhame-response.dto";
import { createMovimentacaoSchema } from "./application/dtos/create-movimentacao.dto";
import { movimentacaoResponseDtoSchema } from "./application/dtos/movimentacao-response.dto";
import { createComodatoSchema } from "./application/dtos/create-comodato.dto";
import { comodatoResponseDtoSchema } from "./application/dtos/comodato-response.dto";

extendZodWithOpenApi(z);

const ErrorSchema = z.object({ error: z.string(), message: z.string() }).openapi("Error");
const CreateVasilhameBodySchema = createVasilhameSchema.openapi("CreateVasilhameBody");
const VasilhameResponseSchema = vasilhameResponseDtoSchema.openapi("VasilhameResponse");
const CreateMovimentacaoBodySchema = createMovimentacaoSchema.openapi("CreateMovimentacaoBody");
const MovimentacaoResponseSchema = movimentacaoResponseDtoSchema.openapi("MovimentacaoResponse");
const CreateComodatoBodySchema = createComodatoSchema.openapi("CreateComodatoBody");
const ComodatoResponseSchema = comodatoResponseDtoSchema.openapi("ComodatoResponse");

const registry = new OpenAPIRegistry();

// Vasilhames
registry.registerPath({
  method: "get",
  path: "/api/vasilhames",
  summary: "Listar vasilhames",
  tags: ["Vasilhames"],
  description: "Público; não exige autenticação.",
  responses: {
    200: {
      description: "Lista de vasilhames",
      content: { "application/json": { schema: z.array(VasilhameResponseSchema) } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/vasilhames",
  summary: "Criar vasilhame",
  tags: ["Vasilhames"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateVasilhameBodySchema } } },
  },
  responses: {
    201: {
      description: "Vasilhame criado",
      content: { "application/json": { schema: VasilhameResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

// Movimentacoes
registry.registerPath({
  method: "get",
  path: "/api/movimentacoes",
  summary: "Listar movimentações de estoque",
  tags: ["Movimentações"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Lista de movimentações",
      content: { "application/json": { schema: z.array(MovimentacaoResponseSchema) } },
    },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/movimentacoes",
  summary: "Registrar movimentação de estoque",
  tags: ["Movimentações"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateMovimentacaoBodySchema } } },
  },
  responses: {
    201: {
      description: "Movimentação registrada",
      content: { "application/json": { schema: MovimentacaoResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Vasilhame não encontrado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

// Comodatos
registry.registerPath({
  method: "get",
  path: "/api/comodatos",
  summary: "Listar comodatos",
  tags: ["Comodatos"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Lista de comodatos",
      content: { "application/json": { schema: z.array(ComodatoResponseSchema) } },
    },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/comodatos",
  summary: "Criar ou atualizar comodato",
  tags: ["Comodatos"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateComodatoBodySchema } } },
  },
  responses: {
    201: {
      description: "Comodato criado/atualizado",
      content: { "application/json": { schema: ComodatoResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Vasilhame não encontrado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

/**
 * Gera a spec OpenAPI 3 a partir dos schemas Zod (fonte única de verdade).
 */
export function createStockOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Stock Service API",
      version: "1.0.0",
      description: "Gestão de vasilhames, movimentações de estoque e comodatos. POST exige JWT.",
    },
    servers: [{ url: serverUrl }],
  });

  const docObj = doc as { components?: { securitySchemes?: object } };
  if (docObj.components) {
    docObj.components.securitySchemes = {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtido no Identity Service (POST /identity/api/auth/login)",
      },
    };
  }
  return doc;
}
