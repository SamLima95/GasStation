import { Request, Response, NextFunction } from "express";
import { CreateRotaUseCase } from "../../../application/use-cases/create-rota.use-case";
import { ListRotasUseCase } from "../../../application/use-cases/list-rotas.use-case";
import { OptimizeRotaUseCase } from "../../../application/use-cases/optimize-rota.use-case";

export class RotaController {
  constructor(private readonly createUC: CreateRotaUseCase, private readonly listUC: ListRotasUseCase, private readonly optimizeUC: OptimizeRotaUseCase) {}
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.status(201).json(await this.createUC.execute(req.body)); } catch (err) { next(err); } };
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined; res.json(await this.listUC.execute(unidadeId)); } catch (err) { next(err); } };
  optimize = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await this.optimizeUC.execute(req.params.id)); } catch (err) { next(err); } };
}
