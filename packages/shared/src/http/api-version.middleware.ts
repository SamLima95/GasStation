import { Request, Response, NextFunction } from "express";

/**
 * Middleware: adiciona header X-API-Version na resposta.
 * Demonstra versionamento de API para contratos estáveis.
 */
export function apiVersionMiddleware(version: string = "v1") {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader("X-API-Version", version);
    next();
  };
}
