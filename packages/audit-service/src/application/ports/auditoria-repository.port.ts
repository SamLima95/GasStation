import type { Auditoria } from "../../domain/entities/auditoria.entity";
import type { AuditoriaFilterDto } from "../dtos/auditoria.dto";

export interface IAuditoriaRepository {
  save(auditoria: Auditoria): Promise<void>;
  findWithFilters(filters: AuditoriaFilterDto): Promise<Auditoria[]>;
  findByEntidade(entidade: string, entidadeId: string): Promise<Auditoria[]>;
}
