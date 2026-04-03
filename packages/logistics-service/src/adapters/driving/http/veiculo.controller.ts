import { Request, Response, NextFunction } from "express";
import { CreateVeiculoUseCase } from "../../../application/use-cases/create-veiculo.use-case";
import { ListVeiculosUseCase } from "../../../application/use-cases/list-veiculos.use-case";

export class VeiculoController {
  constructor(private readonly createUC: CreateVeiculoUseCase, private readonly listUC: ListVeiculosUseCase) {}
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.status(201).json(await this.createUC.execute(req.body)); } catch (err) { next(err); } };
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined; res.json(await this.listUC.execute(unidadeId)); } catch (err) { next(err); } };
}
