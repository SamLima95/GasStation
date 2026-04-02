/**
 * Tipo canônico do provedor OAuth (usado em portas e repositórios).
 */
export type OAuthProvider = "google" | "github";

/**
 * Tipo da unidade (filial ou depósito).
 */
export type TipoUnidade = "filial" | "deposito";

/**
 * Status da unidade.
 */
export type StatusUnidade = "ativa" | "inativa";

/**
 * Nível de acesso do usuário na unidade.
 */
export type NivelAcesso = "operador" | "gerente" | "admin_holding";
