import type { Veiculo } from "../../domain/entities/veiculo.entity";
export interface IVeiculoRepository {
  save(veiculo: Veiculo): Promise<void>;
  findById(id: string): Promise<Veiculo | null>;
  findByPlaca(placa: string): Promise<Veiculo | null>;
  findByUnidadeId(unidadeId: string): Promise<Veiculo[]>;
  findAll(): Promise<Veiculo[]>;
  update(veiculo: Veiculo): Promise<void>;
}
