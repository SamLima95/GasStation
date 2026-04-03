import { Request, Response, NextFunction } from "express";
import { ListEntregasUseCase } from "../../../application/use-cases/list-entregas.use-case";
import { AssignEntregaUseCase } from "../../../application/use-cases/assign-entrega.use-case";
import { ConfirmEntregaUseCase } from "../../../application/use-cases/confirm-entrega.use-case";

export class EntregaController {
  constructor(private readonly listUC: ListEntregasUseCase, private readonly assignUC: AssignEntregaUseCase, private readonly confirmUC: ConfirmEntregaUseCase) {}
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined; res.json(await this.listUC.execute(unidadeId)); } catch (err) { next(err); } };
  assign = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await this.assignUC.execute(req.params.id, req.body.rotaId)); } catch (err) { next(err); } };
  confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await this.confirmUC.execute(req.params.id)); } catch (err) { next(err); } };
}
