import { Request, Response, NextFunction } from "express";
import { CreateMovimentacaoUseCase } from "../../../application/use-cases/create-movimentacao.use-case";
import { ListMovimentacoesUseCase } from "../../../application/use-cases/list-movimentacoes.use-case";
import type { CreateMovimentacaoDto } from "../../../application/dtos/create-movimentacao.dto";

export class MovimentacaoController {
  constructor(
    private readonly createMovimentacaoUseCase: CreateMovimentacaoUseCase,
    private readonly listMovimentacoesUseCase: ListMovimentacoesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateMovimentacaoDto = req.body;
      const result = await this.createMovimentacaoUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movimentacoes = await this.listMovimentacoesUseCase.execute();
      res.json(movimentacoes);
    } catch (err) {
      next(err);
    }
  };
}
