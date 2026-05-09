import { Request, Response, NextFunction } from "express";
import { sendError } from "./send-error";

/**
 * Payload mínimo esperado após verificação do JWT (sub = userId).
 * Serviços podem estender com email, role, etc.
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  sid?: string;
  jti?: string;
  exp?: number;
}

/**
 * Este módulo estende globalmente Express.Request com userId, userEmail e userRole.
 * Em monorepos com um app por processo isso é estável; evite misturar múltiplas apps no mesmo processo.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- extensão de tipos do Express
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: string;
      userPermissions?: string[];
      userTokenId?: string;
      userSessionId?: string;
      userTokenExpiresAt?: number;
      authToken?: string;
    }
  }
}

/**
 * Request após auth middleware: userId garantido; userEmail e userRole opcionais.
 */
export type AuthenticatedRequest = Request & {
  userId: string;
  userEmail?: string;
  userRole?: string;
  userPermissions?: string[];
  userTokenId?: string;
  userSessionId?: string;
  userTokenExpiresAt?: number;
  authToken?: string;
};

/**
 * Middleware: valida Bearer JWT usando a função verify fornecida e anexa userId, userEmail e userRole em req.
 * Uso: createAuthMiddleware((token) => tokenService.verify(token)) ou createAuthMiddleware((token) => jwt.verify(...)).
 */
export function createAuthMiddleware(
  verify: (token: string) => JwtPayload | null,
  options: { isRevoked?: (payload: JwtPayload, token: string) => Promise<boolean> | boolean } = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, 401, "Missing or invalid Authorization header");
      return;
    }
    const token = authHeader.slice(7);
    const payload = verify(token);
    if (!payload) {
      sendError(res, 401, "Invalid or expired token");
      return;
    }
    if (!payload.sub || typeof payload.sub !== "string" || !payload.sub.trim()) {
      sendError(res, 401, "Invalid token: missing subject");
      return;
    }
    const attachAndContinue = (): void => {
      req.userId = payload.sub;
      req.userEmail = payload.email;
      req.userRole = payload.role ?? "user";
      req.userSessionId = payload.sid;
      req.userTokenId = payload.jti;
      req.userTokenExpiresAt = payload.exp;
      req.authToken = token;
      next();
    };

    if (!options.isRevoked) {
      attachAndContinue();
      return;
    }

    Promise.resolve(options.isRevoked(payload, token))
      .then((revoked) => {
        if (revoked) {
          sendError(res, 401, "Revoked token");
          return;
        }
        attachAndContinue();
      })
      .catch(next);
  };
}

/**
 * Middleware: exige que o usuário autenticado tenha a role indicada.
 * Deve ser usado após createAuthMiddleware.
 */
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole !== role) {
      sendError(res, 403, "Forbidden");
      return;
    }
    next();
  };
}

export function requirePermission(
  permission: string,
  resolvePermissions?: (req: Request) => Promise<string[]> | string[]
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissions = resolvePermissions
        ? await resolvePermissions(req)
        : req.userPermissions ?? [];

      if (!permissions.includes(permission)) {
        sendError(res, 403, "Forbidden");
        return;
      }

      req.userPermissions = permissions;
      next();
    } catch (err) {
      next(err);
    }
  };
}
