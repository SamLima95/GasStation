import { Request, Response, NextFunction } from "express";
import { CreateEntregadorUseCase } from "../../../application/use-cases/create-entregador.use-case";
import { ListEntregadoresUseCase } from "../../../application/use-cases/list-entregadores.use-case";

export class EntregadorController {
  constructor(private readonly createUC: CreateEntregadorUseCase, private readonly listUC: ListEntregadoresUseCase) {}
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.status(201).json(await this.createUC.execute(req.body)); } catch (err) { next(err); } };
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined; res.json(await this.listUC.execute(unidadeId)); } catch (err) { next(err); } };
}
