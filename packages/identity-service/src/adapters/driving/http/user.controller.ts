import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateUserUseCase } from "../../../application/use-cases/create-user.use-case";
import { GetUserByIdUseCase } from "../../../application/use-cases/get-user-by-id.use-case";
import { UpdateUserUseCase } from "../../../application/use-cases/update-user.use-case";
import { DeactivateUserUseCase } from "../../../application/use-cases/deactivate-user.use-case";
import type { CreateUserDto } from "../../../application/dtos/create-user.dto";
import type { UpdateUserDto } from "../../../application/dtos/update-user.dto";
import type { IAuditLogger } from "../../../application/ports/audit-logger.port";
import type { AuthenticatedRequest } from "@lframework/shared";
import { sendError } from "@lframework/shared";

const uuidParamSchema = z.string().uuid();

/**
 * Adapter (entrada): controller HTTP que delega aos casos de uso.
 * Rotas protegidas por authMiddleware (+ requireRole em create).
 */
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly auditLogger: IAuditLogger
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const dto: CreateUserDto = authReq.body;
      const result = await this.createUserUseCase.execute(dto);
      await this.auditLogger.log({
        entidade: "User",
        entidadeId: result.id,
        acao: "user.created",
        usuarioId: authReq.userId,
        unidadeId: null,
        detalhes: { email: result.email, name: result.name },
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = authReq.params;
      const parsed = uuidParamSchema.safeParse(id);
      if (!parsed.success) {
        sendError(res, 400, "Invalid user id format");
        return;
      }
      const userId = parsed.data;
      if (authReq.userId !== userId && authReq.userRole !== "admin") {
        sendError(res, 403, "Forbidden");
        return;
      }
      const user = await this.getUserByIdUseCase.execute(userId);
      if (!user) {
        sendError(res, 404, "User not found");
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = authReq.params;
      const parsed = uuidParamSchema.safeParse(id);
      if (!parsed.success) {
        sendError(res, 400, "Invalid user id format");
        return;
      }

      const user = await this.updateUserUseCase.execute(parsed.data, authReq.body as UpdateUserDto);
      await this.auditLogger.log({
        entidade: "User",
        entidadeId: user.id,
        acao: "user.updated",
        usuarioId: authReq.userId,
        unidadeId: null,
        detalhes: { fields: Object.keys(authReq.body ?? {}) },
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = authReq.params;
      const parsed = uuidParamSchema.safeParse(id);
      if (!parsed.success) {
        sendError(res, 400, "Invalid user id format");
        return;
      }

      await this.deactivateUserUseCase.execute(parsed.data);
      await this.auditLogger.log({
        entidade: "User",
        entidadeId: parsed.data,
        acao: "user.deactivated",
        usuarioId: authReq.userId,
        unidadeId: null,
        detalhes: null,
      });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
