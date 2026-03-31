import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createClienteSchema } from "./application/dtos/create-cliente.dto";
import { clienteResponseDtoSchema } from "./application/dtos/cliente-response.dto";
import { createPedidoSchema } from "./application/dtos/create-pedido.dto";
import { pedidoResponseDtoSchema } from "./application/dtos/pedido-response.dto";

extendZodWithOpenApi(z);

const ErrorSchema = z.object({ error: z.string(), message: z.string() }).openapi("Error");
const CreateClienteBody = createClienteSchema.openapi("CreateClienteBody");
const ClienteResponse = clienteResponseDtoSchema.openapi("ClienteResponse");
const CreatePedidoBody = createPedidoSchema.openapi("CreatePedidoBody");
const PedidoResponse = pedidoResponseDtoSchema.openapi("PedidoResponse");

const registry = new OpenAPIRegistry();

// Clientes
registry.registerPath({
  method: "get", path: "/api/clientes", summary: "Listar clientes", tags: ["Clientes"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista de clientes", content: { "application/json": { schema: z.array(ClienteResponse) } } }, 401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } } },
});

registry.registerPath({
  method: "post", path: "/api/clientes", summary: "Criar cliente", tags: ["Clientes"],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateClienteBody } } } },
  responses: { 201: { description: "Cliente criado", content: { "application/json": { schema: ClienteResponse } } }, 400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } }, 401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } } },
});

// Pedidos
registry.registerPath({
  method: "get", path: "/api/pedidos", summary: "Listar pedidos", tags: ["Pedidos"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista de pedidos", content: { "application/json": { schema: z.array(PedidoResponse) } } }, 401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } } },
});

registry.registerPath({
  method: "post", path: "/api/pedidos", summary: "Criar pedido", tags: ["Pedidos"],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreatePedidoBody } } } },
  responses: {
    201: { description: "Pedido criado", content: { "application/json": { schema: PedidoResponse } } },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Cliente não encontrado", content: { "application/json": { schema: ErrorSchema } } },
    422: { description: "Limite de crédito excedido", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "patch", path: "/api/pedidos/{id}/confirm", summary: "Confirmar pedido", tags: ["Pedidos"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: "Pedido confirmado", content: { "application/json": { schema: PedidoResponse } } },
    400: { description: "Transição de status inválida", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Pedido não encontrado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export function createOrderOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Order Service API", version: "1.0.0", description: "Gestão de clientes e pedidos. Todas as rotas exigem JWT." },
    servers: [{ url: serverUrl }],
  });
  const docObj = doc as { components?: { securitySchemes?: object } };
  if (docObj.components) {
    docObj.components.securitySchemes = {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Token obtido no Identity Service (POST /identity/api/auth/login)" },
    };
  }
  return doc;
}
