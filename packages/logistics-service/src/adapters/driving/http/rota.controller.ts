import { Request, Response, NextFunction } from "express";
import { CreateRotaUseCase } from "../../../application/use-cases/create-rota.use-case";
import { ListRotasUseCase } from "../../../application/use-cases/list-rotas.use-case";

export class RotaController {
  constructor(private readonly createUC: CreateRotaUseCase, private readonly listUC: ListRotasUseCase) {}
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.status(201).json(await this.createUC.execute(req.body)); } catch (err) { next(err); } };
  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await this.listUC.execute()); } catch (err) { next(err); } };
}
