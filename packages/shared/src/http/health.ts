import type { Request, Response } from "express";
import type { HealthResponseDto } from "../dtos";

export interface ReadinessCheckResult {
  name: string;
  status: "ok" | "fail";
  details?: Record<string, unknown>;
}

export type ReadinessCheck = () => ReadinessCheckResult | Promise<ReadinessCheckResult>;

export interface ReadinessDependencies {
  prisma?: {
    $queryRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
  };
  redis?: {
    ping: () => Promise<string> | string;
  };
}

export interface ReadinessResponseDto {
  status: "ready" | "not_ready";
  service: string;
  checks: ReadinessCheckResult[];
}

/**
 * Path recomendado: GET /health. Contrato: { status: string, service: string }.
 * Retorna um handler Express que responde 200 com body compatível com HealthResponseDto.
 */
export function createHealthHandler(serviceName: string): (req: Request, res: Response) => void {
  return (_req: Request, res: Response) => {
    const body: HealthResponseDto = { status: "ok", service: serviceName };
    res.status(200).json(body);
  };
}

export function createReadinessHandler(
  serviceName: string,
  checks: ReadinessCheck[] = []
): (_req: Request, res: Response) => Promise<void> {
  return async (_req: Request, res: Response) => {
    const results = await Promise.all(
      checks.map(async (check) => {
        try {
          return await check();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown readiness error";
          return {
            name: "unknown",
            status: "fail" as const,
            details: { message },
          };
        }
      })
    );
    const isReady = results.every((result) => result.status === "ok");
    const body: ReadinessResponseDto = {
      status: isReady ? "ready" : "not_ready",
      service: serviceName,
      checks: results,
    };
    res.status(isReady ? 200 : 503).json(body);
  };
}

export function createDependencyReadinessChecks(
  dependencies: ReadinessDependencies
): ReadinessCheck[] {
  const checks: ReadinessCheck[] = [];

  if (dependencies.prisma) {
    const { prisma } = dependencies;
    checks.push(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { name: "database", status: "ok" };
      } catch (err) {
        return { name: "database", status: "fail", details: failureDetails(err) };
      }
    });
  }

  if (dependencies.redis) {
    const { redis } = dependencies;
    checks.push(async () => {
      try {
        const pong = await redis.ping();
        return {
          name: "redis",
          status: pong === "PONG" ? "ok" : "fail",
          details: pong === "PONG" ? undefined : { message: "Unexpected Redis ping response" },
        };
      } catch (err) {
        return { name: "redis", status: "fail", details: failureDetails(err) };
      }
    });
  }

  return checks;
}

function failureDetails(err: unknown): Record<string, unknown> {
  return {
    message: err instanceof Error ? err.message : "Unknown readiness error",
  };
}
