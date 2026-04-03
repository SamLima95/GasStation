import { Request, Response, NextFunction } from "express";
import { ListAuditoriaUseCase } from "../../../application/use-cases/list-auditoria.use-case";
import type { AuditoriaFilterDto } from "../../../application/dtos/auditoria.dto";

export class AuditoriaController {
  constructor(private readonly listAuditoriaUseCase: ListAuditoriaUseCase) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: AuditoriaFilterDto = {
        servico: typeof req.query.servico === "string" ? req.query.servico : undefined,
        entidade: typeof req.query.entidade === "string" ? req.query.entidade : undefined,
        entidadeId: typeof req.query.entidadeId === "string" ? req.query.entidadeId : undefined,
        acao: typeof req.query.acao === "string" ? req.query.acao : undefined,
        usuarioId: typeof req.query.usuarioId === "string" ? req.query.usuarioId : undefined,
        unidadeId: typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined,
        dataInicio: typeof req.query.dataInicio === "string" ? req.query.dataInicio : undefined,
        dataFim: typeof req.query.dataFim === "string" ? req.query.dataFim : undefined,
      };
      const result = await this.listAuditoriaUseCase.execute(filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
