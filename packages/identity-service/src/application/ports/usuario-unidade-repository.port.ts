import type { UsuarioUnidade } from "../../domain/entities/usuario-unidade.entity";

export interface IUsuarioUnidadeRepository {
  save(vu: UsuarioUnidade): Promise<void>;
  findByUserId(userId: string): Promise<UsuarioUnidade[]>;
  findByUnidadeId(unidadeId: string): Promise<UsuarioUnidade[]>;
  findByUserAndUnidade(userId: string, unidadeId: string): Promise<UsuarioUnidade | null>;
}
