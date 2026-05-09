/**
 * Integration tests for the Auth API (register, login, /auth/me, health).
 * Require PostgreSQL. Redis and RabbitMQ are not required (tests use no-op cache and event publisher).
 * Run with: pnpm test:integration
 * If the database is not available, the suite is skipped (no failure).
 * To run against a real DB: copy the workspace .env.example to .env and run pnpm migrate:all.
 */
import path from "path";
import { config as loadEnv } from "dotenv";
const packageRoot = path.resolve(__dirname, "../../..");
const workspaceRoot = path.resolve(packageRoot, "../..");
loadEnv({ path: path.join(workspaceRoot, ".env") });
loadEnv({ path: path.join(packageRoot, ".env"), override: true });

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createContainer } from "../../container";
import { createApp } from "../../app";
import { createNoOpEventPublisher } from "./test-event-publisher";
import { createNoOpCache } from "./test-cache";

const databaseUrl =
  process.env.IDENTITY_DATABASE_URL ??
  "postgresql://lframework:lframework@localhost:5435/lframework_identity";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6381";
const rabbitmqUrl =
  process.env.RABBITMQ_URL ?? "amqp://lframework:lframework@localhost:5675";
const AUTH_TEST_EMAILS = [
  "alice@example.com",
  "bob@example.com",
  "user@example.com",
  "login@example.com",
  "wrongpass@example.com",
  "unknown@example.com",
  "a@b.com",
  "me@example.com",
  "deleted@example.com",
  "refresh@example.com",
  "sessions@example.com",
  "logout@example.com",
];

describe("Auth API integration", () => {
  const config = {
    databaseUrl,
    redisUrl,
    rabbitmqUrl,
    jwtSecret: "integration-test-secret-min-32-chars-for-jwt",
    jwtExpiresInSeconds: 3600,
    baseUrl: "http://localhost:3001",
    eventPublisherOverride: createNoOpEventPublisher(),
    cacheOverride: createNoOpCache(),
  };

  const container = createContainer(config);
  const app = createApp(container);

  let dbAvailable = false;
  let redisAvailable = false;
  let connected = false;

  /** True when both PostgreSQL and Redis are reachable (required for register/login). */
  const servicesAvailable = () => dbAvailable && redisAvailable;

  beforeAll(async () => {
    try {
      await container.connectRabbitMQ();
      connected = true;
    } catch (err) {
      connected = false;
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        "Integration tests: RabbitMQ unreachable. Suite will use no-op event publisher (eventPublisherOverride).",
        message
      );
    }
    try {
      await container.prisma.$connect();
      await container.prisma.userModel.deleteMany({
        where: { email: { in: AUTH_TEST_EMAILS } },
      });
      dbAvailable = true;
    } catch (err) {
      dbAvailable = false;
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        "Integration tests: PostgreSQL unreachable. Ensure PostgreSQL is up and .env has IDENTITY_DATABASE_URL.",
        message
      );
    }
    try {
      await container.redis.ping();
      redisAvailable = true;
    } catch (err) {
      redisAvailable = false;
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        "Integration tests: Redis unreachable. Register/login tests will be skipped. Ensure Redis is up and .env has REDIS_URL.",
        message
      );
    }
  });

  afterAll(async () => {
    if (connected) {
      await container.disconnect();
    }
  });

  beforeEach(async () => {
    if (!dbAvailable) return;
    await container.prisma.userModel.deleteMany({
      where: { email: { in: AUTH_TEST_EMAILS } },
    });
  });

  describe("POST /api/auth/register", () => {
    it("returns 201 with user and accessToken when payload is valid", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "alice@example.com",
          name: "Alice",
          password: "SecurePass123",
        })
        .expect(201);

      expect(res.body).toMatchObject({
        user: {
          email: "alice@example.com",
          name: "Alice",
        },
        accessToken: expect.any(String),
        expiresIn: expect.any(String),
      });
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user).toHaveProperty("createdAt");
    });

    it("returns 409 when email already exists", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "bob@example.com",
          name: "Bob",
          password: "SecurePass123",
        })
        .expect(201);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "bob@example.com",
          name: "Bob Again",
          password: "OtherPass456",
        })
        .expect(409);

      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid email", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "not-an-email",
          name: "User",
          password: "SecurePass123",
        })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when password is too short", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "user@example.com",
          name: "User",
          password: "short",
        })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when body is empty", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app)
        .post("/api/auth/register")
        .send({})
        .expect(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when email and name are missing", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ password: "ValidPass123" })
        .expect(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 200 with user and accessToken for valid credentials", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "login@example.com",
          name: "Login User",
          password: "MyPassword123",
        })
        .expect(201);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "MyPassword123",
        })
        .expect(200);

      expect(res.body).toMatchObject({
        user: {
          email: "login@example.com",
          name: "Login User",
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(String),
      });
      expect(res.body.user).toHaveProperty("id");
    });

    it("rotates refresh token and rejects the previous refresh token", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "refresh@example.com",
          name: "Refresh User",
          password: "MyPassword123",
        })
        .expect(201);

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "refresh@example.com",
          password: "MyPassword123",
        })
        .expect(200);

      const refreshToken = loginRes.body.refreshToken;
      const refreshRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(refreshRes.body.refreshToken).not.toBe(refreshToken);

      await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(401);
    });

    it("returns 401 for wrong password", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "wrongpass@example.com",
          name: "User",
          password: "CorrectPass123",
        })
        .expect(201);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "wrongpass@example.com",
          password: "WrongPassword",
        })
        .expect(401);

      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for unknown email", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "SomePass123",
        })
        .expect(401);

      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when body is empty", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app)
        .post("/api/auth/login")
        .send({})
        .expect(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when email or password is missing", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "a@b.com" })
        .expect(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("session management", () => {
    it("lists sessions and revokes a selected session", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "sessions@example.com",
          name: "Sessions User",
          password: "MyPassword123",
        })
        .expect(201);

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "sessions@example.com",
          password: "MyPassword123",
        })
        .expect(200);
      const token = loginRes.body.accessToken;

      const sessionsRes = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(sessionsRes.body).toHaveLength(1);
      expect(sessionsRes.body[0]).toMatchObject({ active: true });

      await request(app)
        .delete(`/api/auth/sessions/${sessionsRes.body[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);
    });

    it("logout revokes the current session", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "logout@example.com",
          name: "Logout User",
          password: "MyPassword123",
        })
        .expect(201);

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "logout@example.com",
          password: "MyPassword123",
        })
        .expect(200);

      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .expect(204);

      await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: loginRes.body.refreshToken })
        .expect(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 200 with current user when Authorization header is valid", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "me@example.com",
          name: "Me User",
          password: "Pass12345",
        })
        .expect(201);

      const token = registerRes.body.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchObject({
        email: "me@example.com",
        name: "Me User",
      });
      expect(res.body).toHaveProperty("id");
    });

    it("returns 401 when Authorization header is missing", async ({ skip }) => {
      if (!dbAvailable) skip();
      await request(app).get("/api/auth/me").expect(401);
    });

    it("returns 401 when token is invalid", async ({ skip }) => {
      if (!dbAvailable) skip();
      await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("returns 404 when user was deleted after token was issued", async ({ skip }) => {
      if (!servicesAvailable()) skip();
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "deleted@example.com",
          name: "Deleted User",
          password: "Pass12345",
        })
        .expect(201);
      const token = registerRes.body.accessToken;
      const userId = registerRes.body.user.id;
      await container.prisma.userModel.delete({ where: { id: userId } });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
      expect(res.body).toHaveProperty("error", "User not found");
    });
  });

  describe("GET /api/auth/google", () => {
    it("returns 503 when Google OAuth is not configured", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app).get("/api/auth/google").expect(503);
      expect(res.body).toHaveProperty("error", "Google OAuth is not configured");
    });
  });

  describe("GET /api/auth/github", () => {
    it("returns 503 when GitHub OAuth is not configured", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app).get("/api/auth/github").expect(503);
      expect(res.body).toHaveProperty("error", "GitHub OAuth is not configured");
    });
  });

  describe("GET /health", () => {
    it("returns 200 with service name", async ({ skip }) => {
      if (!dbAvailable) skip();
      const res = await request(app).get("/health").expect(200);
      expect(res.body).toMatchObject({ service: "identity-service" });
    });
  });
});
