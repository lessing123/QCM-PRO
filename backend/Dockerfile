FROM node:20-alpine

WORKDIR /app

# Dépendances système (openssl requis par Prisma)
RUN apk add --no-cache openssl

# Installation des dépendances npm
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Génération du client Prisma
RUN npx prisma generate

# Copie et compilation TypeScript
COPY . .
RUN npm run build

# Script de démarrage (conversion CRLF → LF pour compatibilité Linux)
COPY entrypoint.sh ./
RUN sed -i 's/\r//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
