# Digi Eventos

Sistema de gerenciamento de eventos desenvolvido com TypeScript, oferecendo uma solução completa para organização e controle de eventos.

## Pré-Requisitos

Certifique-se de ter as seguintes ferramentas instaladas antes de começar:

- **Docker Desktop** (Windows/Mac) ou **Docker Engine + Docker Compose** (Linux)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Necessário para executar o banco de dados PostgreSQL e MinIO (armazenamento de arquivos)
- **Bun** (versão 1.0 ou superior)
  - [Instalação do Bun](https://bun.sh/docs/installation)
  - Runtime JavaScript/TypeScript de alto desempenho
- **Node.js** 18+ (opcional, caso prefira usar npm/pnpm)
- **Git** para clonar o repositório

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

## Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto localmente:

### 1. Clone o Repositório

```bash
git clone https://github.com/ovitorhilario/digi-eventos.git
cd digi-eventos
```

### 2. Instale as Dependências

```bash
bun install
```

Este comando instalará todas as dependências do monorepo (frontend, backend e pacotes compartilhados).

### 3. Configure as Variáveis de Ambiente

Crie os arquivos `.env` necessários baseados nos exemplos fornecidos:

**Backend** (`apps/server/.env`):
```bash
# Windows (cmd)
copy apps\server\.env.example apps\server\.env

# Linux/Mac
cp apps/server/.env.example apps/server/.env
```

**Frontend** (`apps/web/.env`):
```bash
# Windows (cmd)
copy apps\web\.env.example apps\web\.env

# Linux/Mac
cp apps/web/.env.example apps/web/.env
```

Edite os arquivos `.env` criados com suas configurações locais, se necessário.

### 4. Inicie os Serviços de Infraestrutura

Execute o Docker Compose para iniciar o PostgreSQL e MinIO:

```bash
bun db:start
```

Aguarde alguns segundos para que os containers inicializem completamente.

### 5. Configure o Banco de Dados

Aplique o esquema ao banco de dados:

```bash
bun db:push
```

(Opcional) Popule o banco com dados de exemplo:

```bash
bun db:seed
```

### 6. Inicie o Servidor de Desenvolvimento

```bash
bun dev
```

Este comando iniciará simultaneamente:
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

🎉 **Pronto!** O sistema está rodando e pronto para uso.

## Comandos Úteis de Banco de Dados

- **Abrir interface visual do banco**: `bun db:studio`
- **Parar containers (mantém dados)**: `bun db:stop`
- **Parar e remover containers**: `bun db:down`
- **Recriar dados de seed**: `bun db:seed`

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
