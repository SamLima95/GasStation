import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICacheService } from "@lframework/shared";
import { LogoutUseCase } from "./logout.use-case";

describe("LogoutUseCase", () => {
  let cache: ICacheService;

  beforeEach(() => {
    cache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("adiciona jti à blacklist até expirar", async () => {
    const exp = Math.floor(Date.now() / 1000) + 120;

    await new LogoutUseCase(cache).execute({ jti: "token-id", exp });

    expect(cache.set).toHaveBeenCalledWith("jwt:blacklist:token-id", true, expect.any(Number));
  });

  it("não falha quando token não tem jti", async () => {
    await new LogoutUseCase(cache).execute({});

    expect(cache.set).not.toHaveBeenCalled();
  });
});
