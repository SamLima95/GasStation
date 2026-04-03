/**
 * Mescla N specs OpenAPI 3 em uma única, prefixando schemas para evitar colisões.
 * Cada spec gera um server para o "Try it out" do Swagger.
 */

export interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  paths?: Record<string, unknown>;
}

export interface NamedSpec {
  name: string;
  prefix: string;
  spec: OpenApiSpec;
}

const REF_PREFIX = "#/components/schemas/";

function prefixRefsInValue(value: unknown, prefix: string, schemaKeys: string[]): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    for (const key of schemaKeys) {
      if (value === REF_PREFIX + key) return REF_PREFIX + prefix + key;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => prefixRefsInValue(item, prefix, schemaKeys));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === "$ref" && typeof v === "string" && v.startsWith(REF_PREFIX)
        ? schemaKeys.reduce((s, key) => s.replace(REF_PREFIX + key, REF_PREFIX + prefix + key), v)
        : prefixRefsInValue(v, prefix, schemaKeys);
    }
    return out;
  }
  return value;
}

function prefixSpec(spec: OpenApiSpec, prefix: string): OpenApiSpec {
  const schemas = spec.components?.schemas ?? {};
  const schemaKeys = Object.keys(schemas);
  if (schemaKeys.length === 0) return spec;

  const prefixedSchemas: Record<string, unknown> = {};
  for (const key of schemaKeys) {
    const value = prefixRefsInValue(schemas[key], prefix, schemaKeys);
    prefixedSchemas[prefix + key] = value;
  }

  const pathValues = spec.paths ? prefixRefsInValue(spec.paths, prefix, schemaKeys) : undefined;
  return {
    ...spec,
    components: {
      ...spec.components,
      schemas: prefixedSchemas,
    },
    paths: pathValues as Record<string, unknown> | undefined,
  };
}

export function mergeOpenApiSpecs(namedSpecs: NamedSpec[]): OpenApiSpec {
  const prefixed = namedSpecs.map((s) => ({
    ...s,
    spec: prefixSpec(s.spec, s.prefix),
  }));

  const mergedServers = prefixed.flatMap((s) => {
    const servers = s.spec.servers ?? [];
    return servers.map((srv) => ({ ...srv, description: srv.description ?? s.name }));
  });

  const mergedSchemas: Record<string, unknown> = {};
  let mergedSecuritySchemes: Record<string, unknown> = {};
  const mergedPaths: Record<string, unknown> = {};

  for (const s of prefixed) {
    Object.assign(mergedSchemas, s.spec.components?.schemas);
    if (s.spec.components?.securitySchemes) {
      mergedSecuritySchemes = { ...mergedSecuritySchemes, ...s.spec.components.securitySchemes };
    }
    Object.assign(mergedPaths, s.spec.paths);
  }

  const serviceList = namedSpecs.map((s) => s.name).join(", ");

  return {
    openapi: "3.0.3",
    info: {
      title: "LFramework API",
      version: "1.0.0",
      description: `Documentação unificada: ${serviceList}. Use o menu «Servers» para alternar o backend nas requisições.`,
    },
    servers: mergedServers,
    components: {
      securitySchemes: mergedSecuritySchemes,
      schemas: mergedSchemas,
    },
    paths: mergedPaths,
  };
}
