import { Request, Response, NextFunction } from "express";
import { CreatePedidoUseCase } from "../../../application/use-cases/create-pedido.use-case";
import { ListPedidosUseCase } from "../../../application/use-cases/list-pedidos.use-case";
import { ConfirmPedidoUseCase } from "../../../application/use-cases/confirm-pedido.use-case";
import type { CreatePedidoDto } from "../../../application/dtos/create-pedido.dto";

export class PedidoController {
  constructor(
    private readonly createPedidoUseCase: CreatePedidoUseCase,
    private readonly listPedidosUseCase: ListPedidosUseCase,
    private readonly confirmPedidoUseCase: ConfirmPedidoUseCase
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

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pedidos = await this.listPedidosUseCase.execute();
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
}
