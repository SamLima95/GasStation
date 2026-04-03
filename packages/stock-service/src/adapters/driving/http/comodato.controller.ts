import { Request, Response, NextFunction } from "express";
import { CreateComodatoUseCase } from "../../../application/use-cases/create-comodato.use-case";
import { ListComodatosUseCase } from "../../../application/use-cases/list-comodatos.use-case";
import type { CreateComodatoDto } from "../../../application/dtos/create-comodato.dto";

export class ComodatoController {
  constructor(
    private readonly createComodatoUseCase: CreateComodatoUseCase,
    private readonly listComodatosUseCase: ListComodatosUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateComodatoDto = req.body;
      const result = await this.createComodatoUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidadeId = typeof req.query.unidadeId === "string" ? req.query.unidadeId : undefined;
      const comodatos = await this.listComodatosUseCase.execute(unidadeId);
      res.json(comodatos);
    } catch (err) {
      next(err);
    }
  };
}
