import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateUnidadeUseCase } from "../../../application/use-cases/create-unidade.use-case";
import { ListUnidadesUseCase } from "../../../application/use-cases/list-unidades.use-case";
import { GetUnidadeByIdUseCase } from "../../../application/use-cases/get-unidade-by-id.use-case";
import { LinkUserToUnidadeUseCase } from "../../../application/use-cases/link-user-to-unidade.use-case";
import { ListUserUnidadesUseCase } from "../../../application/use-cases/list-user-unidades.use-case";
import { UpsertConfiguracaoUseCase } from "../../../application/use-cases/upsert-configuracao.use-case";
import { ListConfiguracoesUseCase } from "../../../application/use-cases/list-configuracoes.use-case";
import type { CreateUnidadeDto } from "../../../application/dtos/unidade.dto";
import type { LinkUserToUnidadeDto } from "../../../application/dtos/usuario-unidade.dto";
import type { UpsertConfiguracaoDto } from "../../../application/dtos/configuracao-unidade.dto";
import { sendError } from "@lframework/shared";

const uuidParamSchema = z.string().uuid();

export class UnidadeController {
  constructor(
    private readonly createUnidadeUseCase: CreateUnidadeUseCase,
    private readonly listUnidadesUseCase: ListUnidadesUseCase,
    private readonly getUnidadeByIdUseCase: GetUnidadeByIdUseCase,
    private readonly linkUserToUnidadeUseCase: LinkUserToUnidadeUseCase,
    private readonly listUserUnidadesUseCase: ListUserUnidadesUseCase,
    private readonly upsertConfiguracaoUseCase: UpsertConfiguracaoUseCase,
    private readonly listConfiguracoesUseCase: ListConfiguracoesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateUnidadeDto = req.body;
      const result = await this.createUnidadeUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listUnidadesUseCase.execute();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = uuidParamSchema.safeParse(req.params.id);
      if (!parsed.success) {
        sendError(res, 400, "ID de unidade inválido");
        return;
      }
      const result = await this.getUnidadeByIdUseCase.execute(parsed.data);
      if (!result) {
        sendError(res, 404, "Unidade não encontrada");
        return;
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  linkUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LinkUserToUnidadeDto = req.body;
      const result = await this.linkUserToUnidadeUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  listUserUnidades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = uuidParamSchema.safeParse(req.params.userId);
      if (!parsed.success) {
        sendError(res, 400, "ID de usuário inválido");
        return;
      }
      const result = await this.listUserUnidadesUseCase.execute(parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  upsertConfiguracao = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidadeId = req.params.id;
      const parsed = uuidParamSchema.safeParse(unidadeId);
      if (!parsed.success) {
        sendError(res, 400, "ID de unidade inválido");
        return;
      }
      const dto: UpsertConfiguracaoDto = { ...req.body, unidadeId: parsed.data };
      const result = await this.upsertConfiguracaoUseCase.execute(dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  listConfiguracoes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = uuidParamSchema.safeParse(req.params.id);
      if (!parsed.success) {
        sendError(res, 400, "ID de unidade inválido");
        return;
      }
      const result = await this.listConfiguracoesUseCase.execute(parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
