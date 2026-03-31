import { randomUUID } from "crypto";
import { Cliente } from "../../domain/entities/cliente.entity";
import type { IClienteRepository } from "../ports/cliente-repository.port";
import type { CreateClienteDto } from "../dtos/create-cliente.dto";
import type { ClienteResponseDto } from "../dtos/cliente-response.dto";
import { InvalidClienteError } from "../errors";

export class CreateClienteUseCase {
  constructor(private readonly clienteRepository: IClienteRepository) {}

  async execute(dto: CreateClienteDto): Promise<ClienteResponseDto> {
    const id = randomUUID();
    try {
      const cliente = Cliente.create(id, dto.nome, dto.documento, dto.limiteCredito, dto.unidadeId);
      await this.clienteRepository.save(cliente);

      return {
        id: cliente.id,
        nome: cliente.nome,
        documento: cliente.documento,
        limiteCredito: cliente.limiteCredito,
        saldoDevedor: cliente.saldoDevedor,
        unidadeId: cliente.unidadeId,
        createdAt: cliente.createdAt.toISOString(),
      };
    } catch (err) {
      throw new InvalidClienteError(err instanceof Error ? err.message : "Invalid cliente");
    }
  }
}
