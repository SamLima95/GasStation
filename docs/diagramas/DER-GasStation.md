# Diagrama Entidade-Relacionamento (DER) - GasStation

Este DER foi elaborado com base no estado atual do `docs/DDE Samuel.txt`, especialmente na secao `3.1.1 Entidade-Relacionamento`.

```mermaid
erDiagram
    PERFIL {
        uuid id PK
        string nome
        string descricao
    }

    USUARIO {
        uuid id PK
        string nome
        string email
        string senha_hash
        boolean ativo
        datetime criado_em
        uuid perfil_id FK
    }

    UNIDADE {
        uuid id PK
        string nome
        string tipo
        boolean ativa
    }

    USUARIO_UNIDADE {
        uuid usuario_id FK
        uuid unidade_id FK
        string nivel_acesso
    }

    CLIENTE {
        uuid id PK
        string nome
        string documento
        decimal limite_credito
        decimal saldo_devedor
        uuid unidade_id FK
    }

    PEDIDO {
        uuid id PK
        uuid cliente_id FK
        uuid unidade_id FK
        string status
        decimal valor_total
        datetime data_pedido
        datetime data_entrega_prevista
    }

    ITEM_PEDIDO {
        uuid id PK
        uuid pedido_id FK
        uuid vasilhame_id FK
        int quantidade
        decimal preco_unitario
    }

    VASILHAME {
        uuid id PK
        string tipo
        string descricao
        decimal capacidade
    }

    MOVIMENTACAO_ESTOQUE {
        uuid id PK
        uuid unidade_id FK
        uuid vasilhame_id FK
        uuid usuario_id FK
        uuid pedido_id FK
        string tipo_movimentacao
        int quantidade
        datetime data_hora
    }

    COMODATO {
        uuid id PK
        uuid cliente_id FK
        uuid unidade_id FK
        uuid vasilhame_id FK
        int saldo_comodato
        datetime atualizado_em
    }

    ROTA {
        uuid id PK
        uuid unidade_id FK
        uuid entregador_id FK
        datetime data_rota
        string status
    }

    ENTREGA {
        uuid id PK
        uuid rota_id FK
        uuid pedido_id FK
        string status
        datetime data_confirmacao
    }

    ENTREGADOR {
        uuid id PK
        string nome
        string documento
        boolean ativo
        uuid unidade_id FK
    }

    VEICULO {
        uuid id PK
        string placa
        string modelo
        boolean ativo
        uuid unidade_id FK
    }

    CAIXA {
        uuid id PK
        uuid unidade_id FK
        date data_abertura
        date data_fechamento
        string status
    }

    CONTA_A_RECEBER {
        uuid id PK
        uuid pedido_id FK
        uuid cliente_id FK
        uuid caixa_id FK
        decimal valor_original
        decimal valor_aberto
        string status
        date vencimento
    }

    AUDITORIA {
        uuid id PK
        string entidade
        uuid entidade_id
        uuid usuario_id FK
        uuid unidade_id FK
        datetime data_hora
        string acao
        string alteracao
    }

    CONFIGURACAO_UNIDADE {
        uuid id PK
        uuid unidade_id FK
        string chave
        string valor
        datetime atualizado_em
    }

    PERFIL ||--o{ USUARIO : "define"
    USUARIO ||--o{ USUARIO_UNIDADE : "possui"
    UNIDADE ||--o{ USUARIO_UNIDADE : "autoriza"

    UNIDADE ||--o{ CLIENTE : "atende"
    CLIENTE ||--o{ PEDIDO : "realiza"
    UNIDADE ||--o{ PEDIDO : "origina"
    PEDIDO ||--|{ ITEM_PEDIDO : "contem"
    VASILHAME ||--o{ ITEM_PEDIDO : "item"

    UNIDADE ||--o{ MOVIMENTACAO_ESTOQUE : "movimenta"
    VASILHAME ||--o{ MOVIMENTACAO_ESTOQUE : "movimentado"
    USUARIO ||--o{ MOVIMENTACAO_ESTOQUE : "registra"
    PEDIDO o|--o{ MOVIMENTACAO_ESTOQUE : "origem_opcional"

    CLIENTE ||--o{ COMODATO : "possui"
    UNIDADE ||--o{ COMODATO : "controla"
    VASILHAME ||--o{ COMODATO : "vincula"

    UNIDADE ||--o{ ROTA : "planeja"
    ENTREGADOR ||--o{ ROTA : "executa"
    ROTA ||--|{ ENTREGA : "agrega"
    PEDIDO ||--o| ENTREGA : "gera"
    UNIDADE ||--o{ ENTREGADOR : "aloca"
    UNIDADE ||--o{ VEICULO : "disponibiliza"

    UNIDADE ||--o{ CAIXA : "mantem"
    PEDIDO ||--o{ CONTA_A_RECEBER : "gera"
    CLIENTE ||--o{ CONTA_A_RECEBER : "deve"
    CAIXA ||--o{ CONTA_A_RECEBER : "baixa"

    USUARIO ||--o{ AUDITORIA : "causa"
    UNIDADE ||--o{ AUDITORIA : "contextualiza"
    UNIDADE ||--o{ CONFIGURACAO_UNIDADE : "parametriza"
```

Observacoes:
- O diagrama representa a visao conceitual inicial do dominio, derivada da documentacao.
- Atributos e cardinalidades podem ser refinados durante a implementacao do DEM completo e do DDL.
