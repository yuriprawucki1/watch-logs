## Watch logs

É um software criado para ser um middleware entre aplicações e o [Graylog](https://graylog.org/), tratando e validando as entradas e saídas.
Construído com [Express](https://expressjs.com/), [Typescript](https://www.typescriptlang.org/) e [Zod](https://zod.dev/) para schemas de validação.

### Utilização

###### Para executar esse projeto você precisa das seguintes variáveis, ou no ambiente ou no `.env` na raiz do projeto:

| Nome | Tipo    | Valor Padrão | Valores permitidos         | Descrição                              |
| :-------- | :------ | :------- | :-------------- | :------------------------------------- |
| `NODE_ENV` | `string`| `development` | `development`/`production` | **Obrigatório**.|
| `PORT` | `string`| `3000` |  | **Obrigatório**. Porta para este projeto executar.|
| `GRAYLOG_HOST` | `string`|  |  | **Obrigatório**. Apenas o nome, ou FQDN, do Graylog.|

#### Modos de execução:

Desenvolvimento:
```command
npm install
npm run dev
```

Produção:
```command
npm install
npm run build
npm run start
```

Docker:
```command
docker build -t watch-logs:1.0.0 .
docker run --name watch-logs \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env GRAYLOG_HOST=graylog.exemplo.com.br \
  watch-logs:1.0.0
```

> ###### Para utilizar o método GET é necessário enviar um token de autorização do tipo Basic com a senha `token`, como se fosse utilizar o próprio Graylog pois de forma padrão ele funciona assim. Inclusive a geração ou revogação desses tokens fica no prórpio Graylog. Este middleware apenas repassa essa informação.

> ###### `logType` disponíveis:
> - erp_homologation
> - erp_production
> - system_homologation
> - system_production

#### Retorna todos os logs de um input

```http
GET /logs/${logType}
```

| Parâmetro | Tipo    | Exemplo         | Descrição                              |
| :-------- | :------ | :-------------- | :------------------------------------- |
| `logType` | `string`| erp_homologation | **Obrigatório**. O input que você quer.|

#### Retorna logs de uma faixa temporal de um input

```http
GET /logs/${logType}?from=${from}&to=${to}
```

| Parâmetro | Tipo      | Exemplo                | Descrição                    |
| :-------- | :-------- | :--------------------- | :--------------------------- |
| `from`    | `datetime`| 2024-12-12T21:03:58.340Z| A data, hora e segundo inicial.|
| `to`      | `datetime`| 2024-12-12T21:04:51.320Z| A data, hora e segundo final. |

#### Retorna logs dos últimos X tempo até agora de um input

```http
GET /logs/${logType}?range=${range}
```

| Parâmetro | Tipo    | Exemplo | Descrição           |
| :-------- | :------ | :------ | :------------------ |
| `range`   | `number`| 300     | Tempo em segundos.  |

#### Retorna logs filtrados por um campo de um input

```http
GET /logs/${logType}?${field}=${value}
```

| Parâmetro | Tipo    | Exemplo | Descrição       |
| :-------- | :------ | :------ | :-------------- |
| `field`   | `string`| trace_id| Campo do log.   |
| `value`   | `any`   | 1234    | Valor do campo. |

> Você pode mesclar os filtros de retorno, por exemplo, faixa temporal com campo_a e campo_b.
>> Ao utilizar o filtro de faixa temporal a consulta será tratada como absoluta, ou seja, ignorará o parâmetro range.
>> Ao utilizar o filtro sem faixa temporal a consulta será tratada como relativa, retornando todos os resultados existentes se um range não for informado.

#### Grava logs em um input

```http
POST /logs/${logType}
```

| Parâmetro | Tipo    | Exemplo         | Descrição                              |
| :-------- | :------ | :-------------- | :------------------------------------- |
| `logType` | `string`| erp_homologation | **Obrigatório**. O input que você quer.|

### Exemplos

###### Query params para `cod_erp` em uma faixa temporal:

```
https://graylog.exemplo.com.br/logs/erp_homologation?from=2024-12-12T21:03:58.340Z&to=2024-12-12T21:04:51.320Z&cod_erp=0000
```

###### Payload para `erp_homologation` ou `erp_production`:

```json
{
    "host": "origem",
    "short_message": "mensagem curta e objetiva",
    "level": 6,
    "full_message": "mensagem completa e detalhada",
    "trace_id": 123456789,
    "cod_erp": "0000",
    "additional_fields": {
        "sistema": "web",
        "linha": 10,
        "credencial_usada": "usuario_impessoal"
    }
}
```

> Esses campos, com excessão do `additional_fields`, são obrigatórios. Não é permitido enviar qualquer outro campo se ele não estiver dentro de `additional_fields`.

###### Payload para `system_homologation` ou `system_production`:

```json
{
    "host": "origem",
    "short_message": "mensagem curta e objetiva",
    "level": 6,
    "full_message": "mensagem completa e detalhada",
    "additional_fields": {
        "modulo": "orchestrator",
        "role": "viewer",
        "user_id": 1234
    }
}
```

> Esses campos, com excessão do `additional_fields`, são obrigatórios. Não é permitido enviar qualquer outro campo se ele não estiver dentro de `additional_fields`.

### Mantenabilidade

Nos arquivos `/src/constants/logType.ts` e `/src/types/LogType.ts` ficam os nomes disponíveis para input.

No arquivo `/src/utils/logTypeConfig.ts` fica o cruzamento entre o nome do input especificado e o endpoint real do Graylog.

Os inputs no Graylog precisam ser do tipo `GELF HTTP` porque é o que está especificado em `/src/services/registerLogs.ts`.
