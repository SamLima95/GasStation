import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { openCaixaSchema } from "./application/dtos/open-caixa.dto";
import { caixaResponseDtoSchema } from "./application/dtos/caixa-response.dto";
import { createContaAReceberSchema } from "./application/dtos/create-conta-a-receber.dto";
import { contaAReceberResponseDtoSchema } from "./application/dtos/conta-a-receber-response.dto";
import { receivePaymentSchema } from "./application/dtos/receive-payment.dto";

extendZodWithOpenApi(z);

const ErrorSchema = z.object({ error: z.string(), message: z.string() }).openapi("Error");
const OpenCaixaBody = openCaixaSchema.openapi("OpenCaixaBody");
const CaixaResponse = caixaResponseDtoSchema.openapi("CaixaResponse");
const CreateContaBody = createContaAReceberSchema.openapi("CreateContaAReceberBody");
const ContaResponse = contaAReceberResponseDtoSchema.openapi("ContaAReceberResponse");
const ReceivePaymentBody = receivePaymentSchema.openapi("ReceivePaymentBody");

const registry = new OpenAPIRegistry();

registry.registerPath({ method: "get", path: "/api/caixas", summary: "Listar caixas", tags: ["Caixas"], security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista de caixas", content: { "application/json": { schema: z.array(CaixaResponse) } } } } });

registry.registerPath({ method: "post", path: "/api/caixas", summary: "Abrir caixa", tags: ["Caixas"], security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: OpenCaixaBody } } } },
  responses: { 201: { description: "Caixa aberto", content: { "application/json": { schema: CaixaResponse } } }, 409: { description: "Caixa já aberto", content: { "application/json": { schema: ErrorSchema } } } } });

registry.registerPath({ method: "patch", path: "/api/caixas/{id}/close", summary: "Fechar caixa", tags: ["Caixas"], security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: "Caixa fechado", content: { "application/json": { schema: CaixaResponse } } }, 404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } } } });

registry.registerPath({ method: "get", path: "/api/contas-a-receber", summary: "Listar contas a receber", tags: ["Contas a Receber"], security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Lista", content: { "application/json": { schema: z.array(ContaResponse) } } } } });

registry.registerPath({ method: "post", path: "/api/contas-a-receber", summary: "Criar conta a receber", tags: ["Contas a Receber"], security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateContaBody } } } },
  responses: { 201: { description: "Conta criada", content: { "application/json": { schema: ContaResponse } } } } });

registry.registerPath({ method: "post", path: "/api/contas-a-receber/{id}/payment", summary: "Registrar pagamento", tags: ["Contas a Receber"], security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }), body: { content: { "application/json": { schema: ReceivePaymentBody } } } },
  responses: { 200: { description: "Pagamento registrado", content: { "application/json": { schema: ContaResponse } } }, 404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } } } });

export function createFinancialOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Financial Service API", version: "1.0.0", description: "Gestão de caixas e contas a receber. Todas as rotas exigem JWT." },
    servers: [{ url: serverUrl }],
  });
  const docObj = doc as { components?: { securitySchemes?: object } };
  if (docObj.components) {
    docObj.components.securitySchemes = { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Token obtido no Identity Service" } };
  }
  return doc;
}
