import { Request, Response, NextFunction } from "express";
import { CreateVasilhameUseCase } from "../../../application/use-cases/create-vasilhame.use-case";
import { ListVasilhamesUseCase } from "../../../application/use-cases/list-vasilhames.use-case";
import type { CreateVasilhameDto } from "../../../application/dtos/create-vasilhame.dto";

export class VasilhameController {
  constructor(
    private readonly createVasilhameUseCase: CreateVasilhameUseCase,
    private readonly listVasilhamesUseCase: ListVasilhamesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateVasilhameDto = req.body;
      const result = await this.createVasilhameUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vasilhames = await this.listVasilhamesUseCase.execute();
      res.json(vasilhames);
    } catch (err) {
      next(err);
    }
  };
}
