import { createValidateBody } from "@lframework/shared";
import { createUnidadeSchema } from "../../../application/dtos/unidade.dto";
import { linkUserToUnidadeSchema } from "../../../application/dtos/usuario-unidade.dto";
import { upsertConfiguracaoSchema } from "../../../application/dtos/configuracao-unidade.dto";

export const validateCreateUnidade = createValidateBody(createUnidadeSchema);

export const validateLinkUserToUnidade = createValidateBody(linkUserToUnidadeSchema);

export const validateUpsertConfiguracao = createValidateBody(
  upsertConfiguracaoSchema.omit({ unidadeId: true })
);
