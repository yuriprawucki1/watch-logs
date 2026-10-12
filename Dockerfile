# Build stage
FROM public.ecr.aws/docker/library/node:24.21.0-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS builder

# Instalar tzdata e configurar timezone
RUN apt-get update && apt-get install -y --no-install-recommends tzdata && \
    ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./

# Instalar exatamente o lockfile, sem scripts de instalação
RUN npm ci --include=dev --ignore-scripts --no-audit

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript para JavaScript
RUN npm run build

# Production stage
FROM public.ecr.aws/docker/library/node:24.21.0-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20
# Instalar tzdata e configurar timezone
RUN apt-get update && apt-get install -y --no-install-recommends tzdata && \
    ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar apenas os arquivos necessários do build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar apenas dependências de produção do lockfile, sem scripts
RUN npm ci --omit=dev --ignore-scripts --no-audit

# Exposição da porta
EXPOSE 3000

CMD ["npm", "start"]
