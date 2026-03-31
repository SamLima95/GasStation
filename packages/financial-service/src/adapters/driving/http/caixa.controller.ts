import { Request, Response, NextFunction } from "express";
import { OpenCaixaUseCase } from "../../../application/use-cases/open-caixa.use-case";
import { CloseCaixaUseCase } from "../../../application/use-cases/close-caixa.use-case";
import { ListCaixasUseCase } from "../../../application/use-cases/list-caixas.use-case";

export class CaixaController {
  constructor(
    private readonly openCaixaUseCase: OpenCaixaUseCase,
    private readonly closeCaixaUseCase: CloseCaixaUseCase,
    private readonly listCaixasUseCase: ListCaixasUseCase
  ) {}

  open = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.status(201).json(await this.openCaixaUseCase.execute(req.body)); } catch (err) { next(err); }
  };

  close = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.closeCaixaUseCase.execute(req.params.id)); } catch (err) { next(err); }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.listCaixasUseCase.execute()); } catch (err) { next(err); }
  };
}
