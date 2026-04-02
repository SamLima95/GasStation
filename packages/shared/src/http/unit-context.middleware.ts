import { Request, Response, NextFunction } from "express";
import { sendError } from "./send-error";

/**
 * Estende globalmente Express.Request com unidadeId para contexto de unidade.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      unidadeId?: string;
    }
  }
}

/**
 * Request com contexto de unidade garantido.
 */
export type UnitContextRequest = Request & {
  userId: string;
  unidadeId: string;
};

/**
 * Middleware: extrai X-Unidade-Id do header e anexa em req.unidadeId.
 * Deve ser usado após authMiddleware.
 * Se opcional=false (padrão), retorna 400 quando o header não está presente.
 */
export function createUnitContextMiddleware(options: { optional?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const unidadeId = req.headers["x-unidade-id"];
    if (typeof unidadeId === "string" && unidadeId.trim()) {
      req.unidadeId = unidadeId.trim();
      next();
      return;
    }

    if (options.optional) {
      next();
      return;
    }

    sendError(res, 400, "Header X-Unidade-Id é obrigatório");
  };
}

/**
 * Middleware: exige que o usuário tenha nível mínimo de acesso na unidade.
 * checkAccess recebe (userId, unidadeId) e retorna o nível ou null se não vinculado.
 */
export function requireUnitAccess(
  checkAccess: (userId: string, unidadeId: string) => Promise<string | null>,
  minimumLevel?: string[]
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Admin global pode acessar qualquer unidade
    if (req.userRole === "admin") {
      next();
      return;
    }

    const userId = req.userId;
    const unidadeId = req.unidadeId;

    if (!userId || !unidadeId) {
      sendError(res, 403, "Acesso negado: contexto de unidade necessário");
      return;
    }

    const nivel = await checkAccess(userId, unidadeId);
    if (!nivel) {
      sendError(res, 403, "Acesso negado: usuário não vinculado a esta unidade");
      return;
    }

    if (minimumLevel && minimumLevel.length > 0 && !minimumLevel.includes(nivel)) {
      sendError(res, 403, "Acesso negado: nível insuficiente para esta unidade");
      return;
    }

    next();
  };
}
