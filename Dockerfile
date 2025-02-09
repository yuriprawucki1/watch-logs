# Build stage
FROM public.ecr.aws/docker/library/node:22.12-slim AS builder

# Instalar tzdata e configurar timezone
RUN apt-get update && apt-get install -y tzdata && \
    ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./

# Atualizar npm para a versão mais recente
RUN npm install -g npm@latest

# Instalar dependências
RUN npm install --no-package-lock

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript para JavaScript
RUN npm run build

# Production stage
FROM public.ecr.aws/docker/library/node:22.12-slim

# Instalar tzdata e configurar timezone
RUN apt-get update && apt-get install -y tzdata && \
    ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata

WORKDIR /app

# Copiar apenas os arquivos necessários do build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Atualizar npm para a versão mais recente
RUN npm install -g npm@latest

# Instalar apenas dependências de produção
RUN npm install --omit=dev --no-package-lock --ignore-scripts

# Exposição da porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
