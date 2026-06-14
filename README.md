# Content Spark

Uma central pessoal para capturar, organizar e transformar ideias soltas em conteudos executaveis.

## Funcionalidades

- Dashboard com metricas, ideias recentes, pipeline, ideias paradas e top ideias por potencial.
- Biblioteca com busca, filtros, ordenacao, favoritos, arquivamento e acoes rapidas.
- Pipeline/Kanban por status de producao.
- Cadastro e edicao completa de ideias.
- Score de potencial com criterios de avaliacao.
- Formatos de saida copiaveis: briefing, LinkedIn, video, thread, prompt e checklist.
- Persistencia local via LocalStorage.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- LocalStorage

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra o endereco exibido pelo Vite, normalmente `http://localhost:5173`.

## Build

```bash
npm run build
```

## Preview de producao

```bash
npm run preview
```

## Dados

Os dados ficam apenas no navegador, usando LocalStorage na chave:

```text
content-spark:ideas
```

Nao ha backend, autenticacao, banco de dados, API externa ou integracao com IA nesta versao.

## Roadmap curto

- Drag and drop no Pipeline.
- Exportacao de formatos em Markdown.
- Filtros por faixa de score.
- Templates por canal.
- Backup/importacao de dados locais.
