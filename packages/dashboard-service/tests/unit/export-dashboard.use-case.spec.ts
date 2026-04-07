import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportDashboardUseCase } from "../../src/application/use-cases/export-dashboard.use-case";
import type { GetDashboardUseCase } from "../../src/application/use-cases/get-dashboard.use-case";
import type { DashboardDto } from "../../src/application/dtos/dashboard.dto";

const mockDashboard: DashboardDto = {
  periodo: { inicio: "2025-01-01", fim: "2025-12-31" },
  unidadeId: "u1",
  resumo: { totalPedidos: 10, pedidosConfirmados: 5, pedidosPendentes: 3, pedidosCancelados: 2, faturamentoTotal: 1500.5, ticketMedio: 300.1 },
  estoque: { totalMovimentacoes: 20, entradas: 10, saidas: 5, retornos: 3, avarias: 2 },
  financeiro: { caixasAbertos: 1, caixasFechados: 2, contasPendentes: 3, contasPagas: 4, contasVencidas: 1, valorTotalAberto: 750.25 },
  logistica: { totalRotas: 5, rotasPlanejadas: 1, rotasEmAndamento: 2, rotasFinalizadas: 2, totalEntregas: 10, entregasEntregues: 6, entregasPendentes: 4 },
  geradoEm: "2025-06-01T00:00:00.000Z",
};

describe("ExportDashboardUseCase", () => {
  let getDashboardUseCase: { execute: ReturnType<typeof vi.fn> };
  let exportUseCase: ExportDashboardUseCase;

  beforeEach(() => {
    getDashboardUseCase = { execute: vi.fn().mockResolvedValue(mockDashboard) };
    exportUseCase = new ExportDashboardUseCase(getDashboardUseCase as unknown as GetDashboardUseCase);
  });

  describe("exportCsv", () => {
    it("deve gerar CSV com header e dados das secoes", async () => {
      const csv = await exportUseCase.exportCsv({});

      expect(csv).toContain("Secao,Metrica,Valor");
      expect(csv).toContain("Resumo,Total Pedidos,10");
      expect(csv).toContain("Resumo,Faturamento Total,1500.5");
      expect(csv).toContain("Estoque,Entradas,10");
      expect(csv).toContain("Financeiro,Caixas Abertos,1");
      expect(csv).toContain("Logistica,Total Rotas,5");
    });

    it("deve repassar filtros ao getDashboardUseCase", async () => {
      const filter = { unidadeId: "u1", dataInicio: "2025-01-01", dataFim: "2025-12-31" };
      await exportUseCase.exportCsv(filter, "Bearer tok");

      expect(getDashboardUseCase.execute).toHaveBeenCalledWith(filter, "Bearer tok");
    });

    it("deve incluir periodo e unidade no CSV", async () => {
      const csv = await exportUseCase.exportCsv({});

      expect(csv).toContain("Periodo,Inicio,2025-01-01");
      expect(csv).toContain("Periodo,Fim,2025-12-31");
      expect(csv).toContain("Periodo,Unidade,u1");
    });
  });

  describe("exportPdf", () => {
    it("deve gerar Buffer PDF valido (magic bytes %PDF)", async () => {
      const pdf = await exportUseCase.exportPdf({});

      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    });

    it("deve repassar filtros ao getDashboardUseCase", async () => {
      const filter = { unidadeId: "u1" };
      await exportUseCase.exportPdf(filter, "Bearer tok");

      expect(getDashboardUseCase.execute).toHaveBeenCalledWith(filter, "Bearer tok");
    });
  });
});
