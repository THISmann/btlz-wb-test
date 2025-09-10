# Étape build
FROM node:20-alpine AS build

WORKDIR /app

# Installer dépendances
COPY package*.json ./
RUN npm install --include=dev

# Copier le code source
COPY . .

# Transpiler TS -> JS (si tu as tsc configuré)
RUN npx tsc -p tsconfig.json

# Étape prod
FROM node:20-alpine AS prod

WORKDIR /app

# Copier uniquement ce qui est nécessaire
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV MOCK_PORT=3000

EXPOSE 3000

CMD ["npm", "run", "mock"]
