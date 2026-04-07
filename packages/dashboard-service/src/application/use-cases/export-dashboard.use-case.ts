import PDFDocument from "pdfkit";
import { GetDashboardUseCase } from "./get-dashboard.use-case";
import type { DashboardFilterDto, DashboardDto } from "../dtos/dashboard.dto";

export class ExportDashboardUseCase {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  async exportCsv(filter: DashboardFilterDto, authHeader?: string): Promise<string> {
    const data = await this.getDashboardUseCase.execute(filter, authHeader);
    return this.buildCsv(data);
  }

  async exportPdf(filter: DashboardFilterDto, authHeader?: string): Promise<Buffer> {
    const data = await this.getDashboardUseCase.execute(filter, authHeader);
    return this.buildPdf(data);
  }

  private buildCsv(data: DashboardDto): string {
    const lines: string[] = ["Secao,Metrica,Valor"];

    lines.push(`Periodo,Inicio,${data.periodo.inicio ?? "Todos"}`);
    lines.push(`Periodo,Fim,${data.periodo.fim ?? "Todos"}`);
    lines.push(`Periodo,Unidade,${data.unidadeId ?? "Todas"}`);
    lines.push("");

    lines.push(`Resumo,Total Pedidos,${data.resumo.totalPedidos}`);
    lines.push(`Resumo,Pedidos Confirmados,${data.resumo.pedidosConfirmados}`);
    lines.push(`Resumo,Pedidos Pendentes,${data.resumo.pedidosPendentes}`);
    lines.push(`Resumo,Pedidos Cancelados,${data.resumo.pedidosCancelados}`);
    lines.push(`Resumo,Faturamento Total,${data.resumo.faturamentoTotal}`);
    lines.push(`Resumo,Ticket Medio,${data.resumo.ticketMedio}`);
    lines.push("");

    lines.push(`Estoque,Total Movimentacoes,${data.estoque.totalMovimentacoes}`);
    lines.push(`Estoque,Entradas,${data.estoque.entradas}`);
    lines.push(`Estoque,Saidas,${data.estoque.saidas}`);
    lines.push(`Estoque,Retornos,${data.estoque.retornos}`);
    lines.push(`Estoque,Avarias,${data.estoque.avarias}`);
    lines.push("");

    lines.push(`Financeiro,Caixas Abertos,${data.financeiro.caixasAbertos}`);
    lines.push(`Financeiro,Caixas Fechados,${data.financeiro.caixasFechados}`);
    lines.push(`Financeiro,Contas Pendentes,${data.financeiro.contasPendentes}`);
    lines.push(`Financeiro,Contas Pagas,${data.financeiro.contasPagas}`);
    lines.push(`Financeiro,Contas Vencidas,${data.financeiro.contasVencidas}`);
    lines.push(`Financeiro,Valor Total Aberto,${data.financeiro.valorTotalAberto}`);
    lines.push("");

    lines.push(`Logistica,Total Rotas,${data.logistica.totalRotas}`);
    lines.push(`Logistica,Rotas Planejadas,${data.logistica.rotasPlanejadas}`);
    lines.push(`Logistica,Rotas Em Andamento,${data.logistica.rotasEmAndamento}`);
    lines.push(`Logistica,Rotas Finalizadas,${data.logistica.rotasFinalizadas}`);
    lines.push(`Logistica,Total Entregas,${data.logistica.totalEntregas}`);
    lines.push(`Logistica,Entregas Entregues,${data.logistica.entregasEntregues}`);
    lines.push(`Logistica,Entregas Pendentes,${data.logistica.entregasPendentes}`);

    return lines.join("\n");
  }

  private buildPdf(data: DashboardDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(20).text("GasStation - Dashboard", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#666666")
        .text(`Gerado em: ${data.geradoEm}`, { align: "center" });
      if (data.periodo.inicio || data.periodo.fim) {
        doc.text(`Periodo: ${data.periodo.inicio ?? "—"} a ${data.periodo.fim ?? "—"}`, { align: "center" });
      }
      if (data.unidadeId) {
        doc.text(`Unidade: ${data.unidadeId}`, { align: "center" });
      }
      doc.moveDown(1);

      // Resumo
      this.addPdfSection(doc, "Resumo de Vendas", [
        ["Total Pedidos", String(data.resumo.totalPedidos)],
        ["Confirmados", String(data.resumo.pedidosConfirmados)],
        ["Pendentes", String(data.resumo.pedidosPendentes)],
        ["Cancelados", String(data.resumo.pedidosCancelados)],
        ["Faturamento Total", `R$ ${data.resumo.faturamentoTotal.toFixed(2)}`],
        ["Ticket Medio", `R$ ${data.resumo.ticketMedio.toFixed(2)}`],
      ]);

      // Estoque
      this.addPdfSection(doc, "Estoque", [
        ["Total Movimentacoes", String(data.estoque.totalMovimentacoes)],
        ["Entradas", String(data.estoque.entradas)],
        ["Saidas", String(data.estoque.saidas)],
        ["Retornos", String(data.estoque.retornos)],
        ["Avarias", String(data.estoque.avarias)],
      ]);

      // Financeiro
      this.addPdfSection(doc, "Financeiro", [
        ["Caixas Abertos", String(data.financeiro.caixasAbertos)],
        ["Caixas Fechados", String(data.financeiro.caixasFechados)],
        ["Contas Pendentes", String(data.financeiro.contasPendentes)],
        ["Contas Pagas", String(data.financeiro.contasPagas)],
        ["Contas Vencidas", String(data.financeiro.contasVencidas)],
        ["Valor Total Aberto", `R$ ${data.financeiro.valorTotalAberto.toFixed(2)}`],
      ]);

      // Logistica
      this.addPdfSection(doc, "Logistica", [
        ["Total Rotas", String(data.logistica.totalRotas)],
        ["Planejadas", String(data.logistica.rotasPlanejadas)],
        ["Em Andamento", String(data.logistica.rotasEmAndamento)],
        ["Finalizadas", String(data.logistica.rotasFinalizadas)],
        ["Total Entregas", String(data.logistica.totalEntregas)],
        ["Entregues", String(data.logistica.entregasEntregues)],
        ["Pendentes", String(data.logistica.entregasPendentes)],
      ]);

      doc.end();
    });
  }

  private addPdfSection(doc: PDFKit.PDFDocument, title: string, rows: [string, string][]): void {
    doc.fontSize(14).fillColor("#333333").text(title);
    doc.moveDown(0.3);

    for (const [label, value] of rows) {
      doc.fontSize(10).fillColor("#444444").text(`${label}: `, { continued: true });
      doc.fillColor("#000000").text(value);
    }
    doc.moveDown(0.8);
  }
}
