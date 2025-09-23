FROM node:20-slim AS build-env
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build