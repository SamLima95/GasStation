import { Request, Response, NextFunction } from "express";
import { CreatePedidoUseCase } from "../../../application/use-cases/create-pedido.use-case";
import { ListPedidosUseCase } from "../../../application/use-cases/list-pedidos.use-case";
import { ConfirmPedidoUseCase } from "../../../application/use-cases/confirm-pedido.use-case";
import type { INotaFiscalRepository } from "../../../application/ports/nota-fiscal-repository.port";
import type { CreatePedidoDto } from "../../../application/dtos/create-pedido.dto";
import { sendError } from "@lframework/shared";

export class PedidoController {
  constructor(
    private readonly createPedidoUseCase: CreatePedidoUseCase,
    private readonly listPedidosUseCase: ListPedidosUseCase,
    private readonly confirmPedidoUseCase: ConfirmPedidoUseCase,
    private readonly notaFiscalRepository: INotaFiscalRepository
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreatePedidoDto = req.body;
      const result = await this.createPedidoUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined;
      const pedidos = await this.listPedidosUseCase.execute(unidadeId);
      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  };

  confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.confirmPedidoUseCase.execute(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getNotaFiscal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nf = await this.notaFiscalRepository.findByPedidoId(req.params.id);
      if (!nf) {
        sendError(res, 404, "Nota fiscal não encontrada para este pedido");
        return;
      }
      res.json({
        id: nf.id, pedidoId: nf.pedidoId, chaveAcesso: nf.chaveAcesso,
        status: nf.status, tentativas: nf.tentativas, mensagem: nf.mensagem,
        createdAt: nf.createdAt.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  };
}
