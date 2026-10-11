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
- `.github/workflows/release-on-main.yml` cria tags e releases quando há push
  para `main`.

## Desenvolvimento e verificações

O Dockerfile usa Node.js 22. Para desenvolvimento local, instale as
dependências pelo lockfile e use os scripts do `package.json`:

- `npm ci` instala as dependências travadas.
- `npm run dev` inicia o servidor em modo de desenvolvimento.
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

