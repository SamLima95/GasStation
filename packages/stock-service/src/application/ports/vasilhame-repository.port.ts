import type { Vasilhame } from "../../domain/entities/vasilhame.entity";

export interface IVasilhameRepository {
  save(vasilhame: Vasilhame): Promise<void>;
  findById(id: string): Promise<Vasilhame | null>;
  findAll(): Promise<Vasilhame[]>;
}
