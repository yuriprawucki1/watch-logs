# watch-logs

[![Validação e release](https://github.com/yuriprawucki1/watch-logs/actions/workflows/release-on-main.yml/badge.svg?branch=main)](https://github.com/yuriprawucki1/watch-logs/actions/workflows/release-on-main.yml)

Middleware HTTP para integrar aplicações ao [Graylog](https://graylog.org/).
Desenvolvido com Express e Zod, valida logs, encaminha-os a inputs GELF HTTP e
consulta mensagens por tipo de log.

## Recursos

- Recebe logs de aplicações ERP e de sistema em homologação ou produção.
- Valida o tipo de log e os campos do payload antes do envio.
- Consulta mensagens no input correspondente, com filtros de campo e período.
- Encaminha logs ao Graylog por inputs GELF HTTP.

## Requisitos

- Node.js 22 e npm; ou Docker para executar o container.
- Acesso de rede ao servidor Graylog.
- Quatro inputs GELF HTTP no Graylog, um para cada tipo de log.

## Configuração

Defina as variáveis de ambiente antes de iniciar o serviço. Elas também podem
ser colocadas em um arquivo `.env` na raiz do projeto.

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `NODE_ENV` | Não | `development` | Ambiente da aplicação: `development` ou `production`. |
| `PORT` | Não | `3000` | Porta HTTP local, de `1` a `65535`. |
| `GRAYLOG_HOST` | Sim | — | Hostname ou FQDN do Graylog, sem protocolo ou porta. |

Exemplo de `.env`:

```dotenv
NODE_ENV=development
PORT=3000
GRAYLOG_HOST=graylog.exemplo.com.br
```

O serviço usa a porta `9000` do Graylog para consultas e as portas GELF
indicadas na tabela abaixo para envio. Os destinos e identificadores de input
estão definidos em `src/utils/logTypeConfig.ts`; ajuste esse mapeamento se os
inputs do seu Graylog forem diferentes.

| `logType` | Tipo de log | Porta GELF HTTP |
| --- | --- | ---: |
| `erp_homologation` | ERP em homologação | `12201` |
| `erp_production` | ERP em produção | `12202` |
| `system_homologation` | Sistema em homologação | `12203` |
| `system_production` | Sistema em produção | `12204` |

## Executar localmente

Clone o repositório e entre no diretório do projeto:

```bash
git clone https://github.com/yuriprawucki1/watch-logs.git
cd watch-logs
```

Instale as dependências travadas pelo lockfile e inicie o servidor:

```bash
npm ci
npm run dev
```

Para executar a versão compilada:

```bash
npm ci
npm run build
npm start
```

Comandos disponíveis:

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento. |
| `npm run lint` | Verifica o código com Biome. |
| `npm run typecheck` | Verifica os tipos TypeScript. |
| `npm test` | Executa os testes com o executor nativo do Node.js. |
| `npm run build` | Compila a aplicação para `dist`. |
| `npm start` | Inicia a aplicação compilada. |

## Executar com Docker

```bash
docker build -t watch-logs:local .

docker run --rm --name watch-logs \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GRAYLOG_HOST=graylog.exemplo.com.br \
  watch-logs:local
```

O container usa Node.js 22.12 e escuta na porta informada por `PORT`.

## API

As operações de envio e consulta usam `/logs/{logType}`. As rotas de envio
recebem JSON; as consultas retornam JSON. `GET` e `POST` em `/` ou `/logs`
retornam `404` com uma mensagem e a lista de tipos aceitos.

### Tipos de log

O parâmetro `logType` aceita somente:

```text
erp_homologation
erp_production
system_homologation
system_production
```

### Enviar um log

```http
POST /logs/{logType}
Content-Type: application/json
```

O corpo comum a todos os tipos contém:

| Campo | Tipo | Obrigatório | Limite |
| --- | --- | --- | --- |
| `host` | string | Sim | 50 caracteres |
| `short_message` | string | Sim | 94 caracteres |
| `level` | inteiro | Sim | De `0` a `7` |
| `full_message` | string | Sim | 10.000 caracteres |
| `additional_fields` | objeto | Não | Campos extras do log |

Os tipos `erp_homologation` e `erp_production` também exigem:

| Campo | Tipo | Obrigatório | Limite |
| --- | --- | --- | --- |
| `trace_id` | inteiro positivo | Sim | — |
| `cod_erp` | string | Sim | 10 caracteres |

Exemplo para um log ERP:

```json
{
  "host": "aplicacao-pedidos",
  "short_message": "Pedido processado",
  "full_message": "Pedido 12345 processado com sucesso.",
  "level": 6,
  "trace_id": 123456789,
  "cod_erp": "0000",
  "additional_fields": {
    "sistema": "web",
    "modulo": "pedidos"
  }
}
```

Exemplo para um log de sistema:

```json
{
  "host": "worker-faturamento",
  "short_message": "Lote de faturamento concluído",
  "full_message": "O lote 20261011 foi processado.",
  "level": 6,
  "additional_fields": {
    "modulo": "faturamento",
    "lote": 20261011
  }
}
```

Campos adicionais devem ficar dentro de `additional_fields`; propriedades
desconhecidas no nível superior são rejeitadas. Esse objeto não pode substituir
metadados GELF protegidos, como `version`, `host`, `short_message`,
`full_message`, `timestamp`, `level`, `facility`, `line` ou `file`. O corpo
HTTP é limitado a 100 KiB. Chaves protegidas em `additional_fields` são
descartadas no envio, sem rejeitar o payload. Os campos extras são incorporados
ao objeto GELF, com `version: "1.1"`; os campos ERP do nível superior prevalecem
sobre extras de mesmo nome.

Após o envio ao Graylog, a resposta é `201 Created`, com o texto `Created`
no corpo (`text/plain`). Isso confirma o sucesso da chamada HTTP ao input,
sem garantir que a mensagem já esteja indexada para consulta.

### Consultar logs

```http
GET /logs/{logType}
Authorization: Basic <credenciais>
```

Use um token de acesso do Graylog como nome de usuário Basic Auth e o texto
literal `token` como senha. O token é encaminhado à API do Graylog para
autenticar a consulta. Gere ou revogue tokens no próprio Graylog; consulte a
[documentação de tokens da API do Graylog](https://go2docs.graylog.org/current/setting_up_graylog/rest_api_access_tokens.htm).
O middleware valida o formato Basic e repassa usuário e senha; não exige
que a senha seja literalmente `token` nem valida o token localmente.

Exemplo para buscar logs ERP por código e período:

```bash
export GRAYLOG_API_TOKEN='seu-token-do-graylog'

curl --get 'http://localhost:3000/logs/erp_homologation' \
  --user "${GRAYLOG_API_TOKEN}:token" \
  --data-urlencode 'cod_erp=0000' \
  --data-urlencode 'from=2026-10-11T10:00:00.000Z' \
  --data-urlencode 'to=2026-10-11T10:30:00.000Z'
```

Os parâmetros de consulta são:

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `from` | data/hora UTC | Início da consulta absoluta, no formato `YYYY-MM-DDTHH:mm:ss.sssZ`. |
| `to` | data/hora UTC | Fim da consulta absoluta, no mesmo formato de `from`. |
| `range` | texto não vazio | Janela relativa em segundos, por exemplo `300`. Se omitida, o serviço envia `0` ao Graylog. O middleware não valida se o texto é numérico. |
| `{campo}={valor}` | texto | Filtro por campo da mensagem; pode ser combinado com outros filtros. |

Para uma consulta absoluta, envie `from` e `to` juntos; nesse caso `range` é
ignorado. Sem o par completo, o serviço usa a consulta relativa. Filtros de
campo são combinados com `AND`, aceitam nomes no padrão
`^[A-Za-z_][A-Za-z0-9_.-]*$` e exigem valores não vazios. Os valores são
escapados antes de compor a consulta do Graylog; caracteres de controle nos
valores são rejeitados. As datas são verificadas pelo formato textual, sem
validação de calendário ou da ordem entre início e fim. Se apenas uma das
datas for enviada, ela também é repassada à consulta relativa.

A resposta é uma lista JSON com as mensagens encontradas, sem alguns metadados
internos do Graylog:

```json
[
  {
    "source": "aplicacao-pedidos",
    "message": "Pedido processado",
    "full_message": "Pedido 12345 processado com sucesso.",
    "level": 6,
    "trace_id": 123456789,
    "cod_erp": "0000"
  }
]
```

### Respostas e erros

| Status | Situação |
| --- | --- |
| `200 OK` | Consulta concluída; retorna uma lista JSON. |
| `201 Created` | Chamada de envio ao Graylog concluída; corpo de texto `Created`. |
| `400 Bad Request` | Parâmetros, cabeçalho ou corpo inválido. |
| `404 Not Found` | Rota base acessada sem um `logType`. |
| `500 Internal Server Error` | Falha interna ou erro de conexão sem resposta do Graylog. |

Quando o Graylog responde com erro, a API repassa o status HTTP e retorna uma
mensagem genérica; credenciais e conteúdo do log não são incluídos na resposta.

Erros de validação retornam `{"errors":{"campo":"mensagem"}}`; propriedades
inesperadas aparecem em `campos_inesperados`. Falhas de autenticação Basic,
filtros e integração usam `{"errors":{"message":"mensagem"}}`. JSON malformado
ou corpo acima do limite retorna `400` com
`{"errors":{"message":"Invalid request"}}`.

O exemplo de consulta é ilustrativo: os campos vêm das mensagens retornadas
pelo Graylog e podem variar conforme seus inputs e pipelines. O middleware
remove a lista de metadados definida em `src/services/fetchLogs.ts`.

## Segurança e transporte

- A rota `GET` exige Basic Auth e usa o token do Graylog para consultar os logs.
- A rota `POST` não exige autenticação na aplicação. Restrinja seu acesso à rede
  confiável ou imponha autenticação em um proxy reverso antes de expô-la.
- O serviço se conecta ao Graylog por HTTP nas portas `9000` e `12201` a `12204`.
  Em redes não confiáveis, proteja as conexões com TLS em um proxy ou na camada
  de rede.
- Não armazene tokens no repositório nem registre credenciais ou conteúdo
  sensível dos logs.

## Estrutura do projeto

- `src/routes`: rotas HTTP e tradução de erros para respostas.
- `src/schemas`: validação de ambiente, cabeçalhos, parâmetros e payloads.
- `src/services`: envio e consulta de logs no Graylog.
- `src/constants/logType.ts`, `src/types/LogType.ts` e
  `src/utils/logTypeConfig.ts`: tipos de log e mapeamento para inputs e portas.
- `src/utils`: validações e transformações compartilhadas.
- `tests`: testes automatizados.

Ao adicionar um tipo de log, atualize a lista, o tipo, os schemas e o mapeamento
do Graylog. Mantenha esta documentação alinhada aos contratos da API.

## Desenvolvimento e revisão

Siga as instruções de [`AGENTS.md`](AGENTS.md) e a configuração do Biome.
Antes de enviar um PR, execute:

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

O workflow `Validate and release` executa essas quatro verificações npm no
job `validate` para PRs destinados a `main`. A publicação de release ocorre
somente em `main` ou por execução manual nesse branch, após a validação.

Envie mudanças por PR e solicite a revisão com um comentário `@codex review`.
Analise os apontamentos e solicite nova revisão após corrigi-los. O template
registra esse processo; a solicitação por comentário não é um bloqueio técnico
de merge. A aprovação humana exigida pelo GitHub deve vir de alguém com
permissão de escrita, diferente do autor do PR.
