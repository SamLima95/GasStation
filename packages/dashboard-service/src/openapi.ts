import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const KpiResumoSchema = z.object({
  totalPedidos: z.number(), pedidosConfirmados: z.number(), pedidosPendentes: z.number(),
  pedidosCancelados: z.number(), faturamentoTotal: z.number(), ticketMedio: z.number(),
}).openapi("KpiResumo");

const KpiEstoqueSchema = z.object({
  totalMovimentacoes: z.number(), entradas: z.number(), saidas: z.number(), retornos: z.number(), avarias: z.number(),
}).openapi("KpiEstoque");

const KpiFinanceiroSchema = z.object({
  caixasAbertos: z.number(), caixasFechados: z.number(), contasPendentes: z.number(),
  contasPagas: z.number(), contasVencidas: z.number(), valorTotalAberto: z.number(),
}).openapi("KpiFinanceiro");

const KpiLogisticaSchema = z.object({
  totalRotas: z.number(), rotasPlanejadas: z.number(), rotasEmAndamento: z.number(),
  rotasFinalizadas: z.number(), totalEntregas: z.number(), entregasEntregues: z.number(), entregasPendentes: z.number(),
}).openapi("KpiLogistica");

const DashboardResponseSchema = z.object({
  periodo: z.object({ inicio: z.string().nullable(), fim: z.string().nullable() }),
  unidadeId: z.string().nullable(),
  resumo: KpiResumoSchema, estoque: KpiEstoqueSchema,
  financeiro: KpiFinanceiroSchema, logistica: KpiLogisticaSchema,
  geradoEm: z.string(),
}).openapi("DashboardResponse");

const ErrorSchema = z.object({ error: z.string() }).openapi("Error");

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/api/v1/dashboard",
  summary: "Dashboard consolidado com KPIs de todos os serviços",
  tags: ["Dashboard"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      unidadeId: z.string().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }),
  },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: DashboardResponseSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export function createDashboardOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Dashboard Service API", version: "1.0.0", description: "KPIs consolidados — faturamento, estoque, financeiro e logística." },
    servers: [{ url: serverUrl }],
  });
  const docObj = doc as { components?: { securitySchemes?: object } };
  if (docObj.components) {
    docObj.components.securitySchemes = {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    };
  }
  return doc;
}
