---
name: Never stop existing containers
description: When Docker ports conflict, always change GasStation ports instead of stopping other project containers
type: feedback
---

Sempre mudar as portas do GasStation quando houver conflito. Nunca parar containers de outros projetos.

**Why:** O usuario roda multiplos projetos simultaneamente e nao quer interromper outros ambientes.

**How to apply:** Ao configurar Docker ou detectar conflitos de porta, sempre ajustar as portas do GasStation no .env e docker-compose. Nunca sugerir parar containers existentes.
