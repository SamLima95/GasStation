import { Request, Response, NextFunction } from "express";
import { CreateClienteUseCase } from "../../../application/use-cases/create-cliente.use-case";
import { ListClientesUseCase } from "../../../application/use-cases/list-clientes.use-case";
import type { CreateClienteDto } from "../../../application/dtos/create-cliente.dto";

export class ClienteController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly listClientesUseCase: ListClientesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateClienteDto = req.body;
      const result = await this.createClienteUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined;
      const clientes = await this.listClientesUseCase.execute(unidadeId);
      res.json(clientes);
    } catch (err) {
      next(err);
    }
  };
}
