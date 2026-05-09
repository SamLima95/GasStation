import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserController } from "./user.controller";
import type { CreateUserUseCase } from "../../../application/use-cases/create-user.use-case";
import type { GetUserByIdUseCase } from "../../../application/use-cases/get-user-by-id.use-case";
import type { UpdateUserUseCase } from "../../../application/use-cases/update-user.use-case";
import type { DeactivateUserUseCase } from "../../../application/use-cases/deactivate-user.use-case";
import type { Response } from "express";
import type { NextFunction } from "express";
import {
  UserAlreadyExistsError,
  InvalidEmailError,
} from "../../../application/errors";
import { mapApplicationErrorToHttp } from "./error-to-http.mapper";
import { sendError } from "@lframework/shared";
import { createMockAuthenticatedRequest } from "@lframework/shared/test";

describe("UserController", () => {
  let createUserUseCase: CreateUserUseCase;
  let getUserByIdUseCase: GetUserByIdUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deactivateUserUseCase: DeactivateUserUseCase;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    createUserUseCase = { execute: vi.fn() } as unknown as CreateUserUseCase;
    getUserByIdUseCase = { execute: vi.fn() } as unknown as GetUserByIdUseCase;
    updateUserUseCase = { execute: vi.fn() } as unknown as UpdateUserUseCase;
    deactivateUserUseCase = { execute: vi.fn() } as unknown as DeactivateUserUseCase;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
    next = ((err: unknown) => {
      const { statusCode, message } = mapApplicationErrorToHttp(err);
      sendError(res as Response, statusCode, message);
    }) as NextFunction;
  });

  describe("create", () => {
    it("deve retornar 201 e o usuário criado em sucesso", async () => {
      const created = {
        id: "id-1",
        email: "u@example.com",
        name: "Nome",
        createdAt: "2025-01-01T00:00:00.000Z",
      };
      vi.mocked(createUserUseCase.execute).mockResolvedValue(created);

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ body: { email: "u@example.com", name: "Nome" }, userId: "admin-1", userRole: "admin" });
      await controller.create(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("deve retornar 409 quando UserAlreadyExistsError", async () => {
      vi.mocked(createUserUseCase.execute).mockRejectedValue(
        new UserAlreadyExistsError("User with this email already exists")
      );

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ body: { email: "existente@example.com", name: "X" }, userId: "a", userRole: "admin" });
      await controller.create(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "User with this email already exists" });
    });

    it("deve retornar 400 quando InvalidEmailError", async () => {
      vi.mocked(createUserUseCase.execute).mockRejectedValue(new InvalidEmailError("Invalid email"));

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ body: { email: "invalido", name: "X" }, userId: "a", userRole: "admin" });
      await controller.create(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid email" });
    });

    it("deve retornar 500 para erro não mapeado", async () => {
      vi.mocked(createUserUseCase.execute).mockRejectedValue(new Error("DB error"));

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ body: { email: "u@example.com", name: "X" }, userId: "a", userRole: "admin" });
      await controller.create(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getById", () => {
    const uuidOwner = "11111111-1111-1111-1111-111111111111";
    const uuidOther = "22222222-2222-2222-2222-222222222222";
    const uuidAdmin = "33333333-3333-3333-3333-333333333333";

    it("deve retornar usuário quando encontrado e requester é o dono", async () => {
      const user = {
        id: uuidOwner,
        email: "u@example.com",
        name: "Nome",
        createdAt: "2025-01-01T00:00:00.000Z",
      };
      vi.mocked(getUserByIdUseCase.execute).mockResolvedValue(user);

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ params: { id: uuidOwner }, userId: uuidOwner, userRole: "user" });
      await controller.getById(req, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(getUserByIdUseCase.execute).toHaveBeenCalledWith(uuidOwner);
    });

    it("deve retornar 400 quando id não é UUID", async () => {
      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ params: { id: "nao-uuid" }, userId: uuidOwner, userRole: "user" });
      await controller.getById(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid user id format" });
      expect(getUserByIdUseCase.execute).not.toHaveBeenCalled();
    });

    it("deve retornar 403 quando requester não é o dono nem admin", async () => {
      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ params: { id: uuidOther }, userId: uuidOwner, userRole: "user" });
      await controller.getById(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
      expect(getUserByIdUseCase.execute).not.toHaveBeenCalled();
    });

    it("deve permitir admin acessar qualquer usuário", async () => {
      const user = { id: uuidOther, email: "x@y.com", name: "X", createdAt: "2025-01-01T00:00:00.000Z" };
      vi.mocked(getUserByIdUseCase.execute).mockResolvedValue(user);

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ params: { id: uuidOther }, userId: uuidAdmin, userRole: "admin" });
      await controller.getById(req, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(getUserByIdUseCase.execute).toHaveBeenCalledWith(uuidOther);
    });

    it("deve retornar 404 quando usuário não existe", async () => {
      vi.mocked(getUserByIdUseCase.execute).mockResolvedValue(null);

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ params: { id: uuidOwner }, userId: uuidOwner, userRole: "user" });
      await controller.getById(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("deve retornar 500 quando use case lança", async () => {
      vi.mocked(getUserByIdUseCase.execute).mockRejectedValue(new Error("DB error"));

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({ params: { id: uuidOwner }, userId: uuidOwner, userRole: "user" });
      await controller.getById(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("update", () => {
    const uuidUser = "11111111-1111-1111-1111-111111111111";

    it("deve retornar usuário atualizado", async () => {
      const updated = {
        id: uuidUser,
        email: "novo@example.com",
        name: "Novo Nome",
        role: "manager",
        status: "active",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-02T00:00:00.000Z",
      };
      vi.mocked(updateUserUseCase.execute).mockResolvedValue(updated);

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({
        params: { id: uuidUser },
        body: { name: "Novo Nome" },
        userId: "admin-1",
        userRole: "admin",
      });
      await controller.update(req, res as Response, next);

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(uuidUser, { name: "Novo Nome" });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("deve retornar 400 quando id não é UUID", async () => {
      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({
        params: { id: "bad-id" },
        body: { name: "Novo Nome" },
        userId: "admin-1",
        userRole: "admin",
      });
      await controller.update(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid user id format" });
      expect(updateUserUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe("deactivate", () => {
    const uuidUser = "11111111-1111-1111-1111-111111111111";

    it("deve retornar 204 quando desativa usuário", async () => {
      vi.mocked(deactivateUserUseCase.execute).mockResolvedValue(undefined);

      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({
        params: { id: uuidUser },
        userId: "admin-1",
        userRole: "admin",
      });
      await controller.deactivate(req, res as Response, next);

      expect(deactivateUserUseCase.execute).toHaveBeenCalledWith(uuidUser);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve retornar 400 quando id não é UUID", async () => {
      const controller = new UserController(createUserUseCase, getUserByIdUseCase, updateUserUseCase, deactivateUserUseCase);
      const req = createMockAuthenticatedRequest({
        params: { id: "bad-id" },
        userId: "admin-1",
        userRole: "admin",
      });
      await controller.deactivate(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid user id format" });
      expect(deactivateUserUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
