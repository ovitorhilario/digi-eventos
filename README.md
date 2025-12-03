# Digi Eventos

## Recursos

- **TypeScript** - Para segurança de tipos e melhor experiência do desenvolvedor
- **TanStack Router** - Roteamento baseado em arquivos com segurança total de tipos
- **TailwindCSS** - CSS utilitário para desenvolvimento rápido de UI
- **coss/ui** - Componentes de UI reutilizáveis
- **Elysia** - Framework de alto desempenho com segurança de tipos
- **Bun** - Ambiente de execução
- **Drizzle** - ORM TypeScript-first
- **PostgreSQL** - Motor de banco de dados
- **Turborepo** - Sistema de build otimizado para monorepo

## Começando

Primeiro, instale as dependências:

```bash
bun install
```

## Configuração do Banco de Dados

Este projeto usa PostgreSQL com Drizzle ORM.

Para configurar o banco de dados usando Docker:

1. Inicie o banco de dados:

```bash
bun db:start
```

2. Aplique o esquema ao banco de dados:

```bash
bun db:push
```

3. Semee o banco de dados (opcional):

```bash
bun db:seed
```

4. Para parar o banco de dados:

```bash
bun db:down
```

Ou

```bash
bun db:stop
```

Em seguida, execute o servidor de desenvolvimento para rodar o sistema:

```bash
bun dev
```

Abra [http://localhost:3001](http://localhost:3001) no navegador para ver a aplicação web.
A API está rodando em [http://localhost:3000](http://localhost:3000).

## Estrutura do Projeto

```
digi-eventos/
├── apps/
│   ├── web/         # Aplicação frontend (React + TanStack Router)
│   └── server/      # API backend (Elysia)
├── packages/
│   ├── api/         # Camada API / lógica de negócio
```

## Scripts Disponíveis

- `bun dev`: Iniciar todas as aplicações em modo de desenvolvimento
- `bun build`: Construir todas as aplicações
- `bun dev:web`: Iniciar apenas a aplicação web
- `bun dev:server`: Iniciar apenas o servidor
- `bun check-types`: Verificar tipos TypeScript em todas as apps
- `bun db:push`: Enviar mudanças de esquema para o banco de dados
- `bun db:studio`: Abrir interface do estúdio do banco de dados
- `bun db:start`: Iniciar o banco de dados com Docker
- `bun db:seed`: Semear o banco de dados
- `bun db:down`: Parar e remover os containers do banco de dados
- `bun db:stop`: Parar os containers do banco de dados
