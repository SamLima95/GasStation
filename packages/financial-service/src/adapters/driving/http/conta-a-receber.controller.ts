import { Request, Response, NextFunction } from "express";
import { CreateContaAReceberUseCase } from "../../../application/use-cases/create-conta-a-receber.use-case";
import { ListContasAReceberUseCase } from "../../../application/use-cases/list-contas-a-receber.use-case";
import { ReceivePaymentUseCase } from "../../../application/use-cases/receive-payment.use-case";

export class ContaAReceberController {
  constructor(
    private readonly createContaAReceberUseCase: CreateContaAReceberUseCase,
    private readonly listContasAReceberUseCase: ListContasAReceberUseCase,
    private readonly receivePaymentUseCase: ReceivePaymentUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.status(201).json(await this.createContaAReceberUseCase.execute(req.body)); } catch (err) { next(err); }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.listContasAReceberUseCase.execute()); } catch (err) { next(err); }
  };

  receivePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.receivePaymentUseCase.execute(req.params.id, req.body)); } catch (err) { next(err); }
  };
}
