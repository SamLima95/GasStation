import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerSchema } from "./application/dtos/register.dto";
import { loginSchema } from "./application/dtos/login.dto";
import { createUserSchema } from "./application/dtos/create-user.dto";
import { updateUserSchema } from "./application/dtos/update-user.dto";
import { userResponseDtoSchema } from "./application/dtos/user-response.dto";
import { createUnidadeSchema, unidadeResponseDtoSchema } from "./application/dtos/unidade.dto";
import { linkUserToUnidadeSchema, usuarioUnidadeResponseDtoSchema } from "./application/dtos/usuario-unidade.dto";
import { upsertConfiguracaoSchema, configuracaoUnidadeResponseDtoSchema } from "./application/dtos/configuracao-unidade.dto";

extendZodWithOpenApi(z);

const ErrorSchema = z.object({ error: z.string(), message: z.string() }).openapi("Error");
const RegisterBodySchema = registerSchema.openapi("RegisterBody");
const LoginBodySchema = loginSchema.openapi("LoginBody");
const UserResponseSchema = userResponseDtoSchema.openapi("UserResponse");
const AuthResponseSchema = z
  .object({
    user: UserResponseSchema,
    accessToken: z.string(),
    expiresIn: z.string(),
  })
  .openapi("AuthResponse");
const CreateUserBodySchema = createUserSchema.openapi("CreateUserBody");
const UpdateUserBodySchema = updateUserSchema.openapi("UpdateUserBody");
const OAuthQuerySchema = z.object({ code: z.string(), state: z.string() });

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  summary: "Registrar usuário",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterBodySchema } },
    },
  },
  responses: {
    201: {
      description: "Usuário criado",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    409: { description: "Email já existe", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Login",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: LoginBodySchema } },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: {
      description: "Credenciais inválidas",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  summary: "Usuário atual (JWT)",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Usuário não encontrado",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/google",
  summary: "Redirect para login Google (OAuth)",
  tags: ["Auth"],
  responses: { 302: { description: "Redirect para provedor" } },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/google/callback",
  summary: "Callback OAuth Google (query: code, state)",
  tags: ["Auth"],
  request: { query: OAuthQuerySchema },
  responses: { 302: { description: "Redirect com token ou erro" } },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/github",
  summary: "Redirect para login GitHub (OAuth)",
  tags: ["Auth"],
  responses: { 302: { description: "Redirect para provedor" } },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/github/callback",
  summary: "Callback OAuth GitHub (query: code, state)",
  tags: ["Auth"],
  request: { query: OAuthQuerySchema },
  responses: { 302: { description: "Redirect com token ou erro" } },
});

registry.registerPath({
  method: "post",
  path: "/api/users",
  summary: "Criar usuário (admin)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateUserBodySchema } },
    },
  },
  responses: {
    201: {
      description: "Criado",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Sem permissão (admin)",
      content: { "application/json": { schema: ErrorSchema } },
    },
    409: { description: "Email já existe", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/users/{id}",
  summary: "Buscar usuário por ID",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/users/{id}",
  summary: "Editar usuário (permissão users:update:any)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: UpdateUserBodySchema } },
    },
  },
  responses: {
    200: {
      description: "Atualizado",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    403: { description: "Sem permissão", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Não encontrado", content: { "application/json": { schema: ErrorSchema } } },
    409: { description: "Email já existe", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/users/{id}",
  summary: "Desativar usuário (permissão users:deactivate:any)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    204: { description: "Desativado" },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    403: { description: "Sem permissão", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Não encontrado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

// ── Unidade schemas ──
const CreateUnidadeBodySchema = createUnidadeSchema.openapi("CreateUnidadeBody");
const UnidadeResponseSchema = unidadeResponseDtoSchema.openapi("UnidadeResponse");
const LinkUserToUnidadeBodySchema = linkUserToUnidadeSchema.openapi("LinkUserToUnidadeBody");
const UsuarioUnidadeResponseSchema = usuarioUnidadeResponseDtoSchema.openapi("UsuarioUnidadeResponse");
const UpsertConfiguracaoBodySchema = upsertConfiguracaoSchema.omit({ unidadeId: true }).openapi("UpsertConfiguracaoBody");
const ConfiguracaoUnidadeResponseSchema = configuracaoUnidadeResponseDtoSchema.openapi("ConfiguracaoUnidadeResponse");

registry.registerPath({
  method: "post",
  path: "/api/unidades",
  summary: "Criar unidade (admin)",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateUnidadeBodySchema } } } },
  responses: {
    201: { description: "Criada", content: { "application/json": { schema: UnidadeResponseSchema } } },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    403: { description: "Sem permissão", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/unidades",
  summary: "Listar unidades",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.array(UnidadeResponseSchema) } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/unidades/{id}",
  summary: "Buscar unidade por ID",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: UnidadeResponseSchema } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Não encontrada", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/unidades/usuarios",
  summary: "Vincular usuário a unidade (admin)",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: LinkUserToUnidadeBodySchema } } } },
  responses: {
    201: { description: "Vinculado", content: { "application/json": { schema: UsuarioUnidadeResponseSchema } } },
    400: { description: "Validação", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Usuário ou unidade não encontrada", content: { "application/json": { schema: ErrorSchema } } },
    409: { description: "Já vinculado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/unidades/usuarios/{userId}",
  summary: "Listar unidades de um usuário",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ userId: z.string().uuid() }) },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.array(UsuarioUnidadeResponseSchema) } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/unidades/{id}/configuracoes",
  summary: "Criar/atualizar configuração de unidade (admin)",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { "application/json": { schema: UpsertConfiguracaoBodySchema } } },
  },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: ConfiguracaoUnidadeResponseSchema } } },
    404: { description: "Unidade não encontrada", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/unidades/{id}/configuracoes",
  summary: "Listar configurações de unidade",
  tags: ["Unidades"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.array(ConfiguracaoUnidadeResponseSchema) } } },
    401: { description: "Não autenticado", content: { "application/json": { schema: ErrorSchema } } },
  },
});

/**
 * Gera a spec OpenAPI 3 a partir dos schemas Zod (fonte única de verdade).
 * serverUrl: base do serviço (ex.: http://localhost:3001 ou http://localhost/identity quando atrás do nginx).
 */
export function createIdentityOpenApi(serverUrl: string): object {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Identity Service API",
      version: "1.0.0",
      description: "Autenticação, registro e gestão de usuários.",
    },
    servers: [{ url: serverUrl }],
  });

  const docObj = doc as { components?: { securitySchemes?: object } };
  if (docObj.components) {
    docObj.components.securitySchemes = {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtido em POST /api/auth/login ou /api/auth/register",
      },
    };
  }
  return doc;
}
