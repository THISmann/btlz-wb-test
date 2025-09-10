FROM node:20-alpine AS deps-prod

WORKDIR /app
COPY ./package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS build

WORKDIR /app
COPY ./package*.json ./
RUN npm install --include=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/tsconfig.json ./ 

COPY --from=build /app/src/config/api-key.json ./dist/config  

RUN npm install tsconfig-paths

CMD ["node", "-r", "tsconfig-paths/register", "dist/app.js"]