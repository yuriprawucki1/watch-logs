# Instruções para agentes

## Visão do projeto

`watch-logs` é um middleware HTTP em Express e TypeScript que valida logs com
Zod e os consulta ou envia ao Graylog. A documentação de uso está em
[`README.md`](README.md).

## Estrutura

- `src/routes` define as rotas e traduz erros para respostas HTTP.
- `src/schemas` valida ambiente, parâmetros, cabeçalhos e payloads.
- `src/services` integra as operações de consulta e envio com o Graylog.
- `src/constants/logType.ts`, `src/types/LogType.ts` e
  `src/utils/logTypeConfig.ts` mantêm os tipos de log e seu mapeamento para
  inputs e portas do Graylog.
- `src/utils` contém validações e transformações compartilhadas.
- `tests` contém testes automatizados; hoje há cobertura de segurança em
  `tests/security.test.ts`.
- `.github/workflows/release-on-main.yml` valida pull requests e pushes para
  `main`; publica uma release para uma nova versão e permite recuperar uma
  publicação interrompida por execução manual em `main`.

## Desenvolvimento e verificações

O Dockerfile e a CI usam Node.js 24.21.0 LTS, fixado em `.nvmrc`. Para
desenvolvimento local, instale as dependências pelo lockfile e use os scripts
do `package.json`:

- `npm ci` instala as dependências travadas.
- `npm run dev` inicia o servidor em modo de desenvolvimento.
- `npm run commit` abre o assistente `czg` para mensagens Conventional Commit.
- `npm run lint` verifica formatação e regras do Biome.
- `npm run typecheck` verifica os tipos TypeScript.
- `npm test` executa os testes com o executor nativo do Node.
- `npm run build` compila a aplicação para `dist`.

Siga a formatação definida em `biome.json`. Se alterar dependências em
`package.json`, atualize `package-lock.json` com npm; não edite o lockfile
manualmente.

## Regras para mudanças

- Mantenha tipos, schemas e validações coerentes. Para adicionar um `logType`,
  atualize a lista, o tipo e o mapeamento para o Graylog.
- Preserve as respostas HTTP e os formatos de payload documentados, a menos
  que a tarefa peça uma mudança de contrato.
- Mantenha filtros de consulta validados e escapados antes de compor a sintaxe
  do Graylog. Não aceite nomes de campo ou destinos arbitrários.
- Não permita que `additional_fields` sobrescreva campos GELF protegidos.
- Preserve limites de tamanho, timeouts e bloqueio de redirects nas chamadas
  ao Graylog. Não registre credenciais nem conteúdo sensível dos logs.
- Mantenha segredos e arquivos de ambiente fora do repositório.
- Antes de alterar o workflow de release, confira permissões, condições de
  publicação, tratamento de falhas e se as verificações do projeto são
  executadas antes da criação da release.

## Documentação

- Mantenha o `README.md` em pt-BR e alinhado ao comportamento implementado.
- Atualize-o no mesmo PR quando mudarem rotas, parâmetros, schemas, tipos de
  log, variáveis de ambiente, padrões, portas ou instruções de execução.
- Confira exemplos diretamente contra os schemas e comandos atuais; não
  documente autenticação, validações ou limites que o código não aplica.
- Confira também os corpos de resposta: o POST usa `res.sendStatus(201)` e
  retorna texto `Created`. Campos GELF protegidos em `additional_fields` são
  descartados, sem rejeitar o payload; `range` é validado como texto não vazio.

## Processo de pull request

- Trabalhe em uma branch e envie mudanças por PR para `main`; não faça commits
  diretamente em `main`.
- Execute lint, typecheck, testes, build e `git diff --check` antes de concluir.
- Solicite revisão em um comentário `@codex review`, analise os apontamentos e
  solicite nova revisão após corrigi-los. O template documenta esse processo;
  a solicitação por comentário não constitui um requisito técnico de merge.
- Após a revisão do Codex e o sucesso das verificações, o responsável pelo
  repositório ou um colaborador com permissão de escrita pode concluir o merge,
  inclusive quando for o autor do PR. Não exija uma aprovação humana separada.
- Preserve a branch de origem enquanto o PR estiver aberto; remova-a após o
  merge, respeitando as regras de proteção do GitHub.

## Code Review Rules

### Compatibilidade da API

- Sinalize mudanças incompatíveis em rotas, `logType`, payloads, status HTTP,
  respostas ou configuração pública sem atualização explícita da documentação.
  Preserve o contrato existente ou descreva a migração necessária.

### Fronteiras de dados e Graylog

- Exija nomes de campo permitidos e valores escapados antes de montar consultas;
  nunca aceite destinos Graylog arbitrários nem exponha tokens ou conteúdo
  sensível dos logs.
- Preserve os campos GELF protegidos, o limite do corpo, os timeouts e o bloqueio
  de redirects nas chamadas ao Graylog.

