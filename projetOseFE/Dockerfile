# Étape 1 : Build de l'application
FROM node:18-alpine AS build

WORKDIR /app

# Copie les fichiers de configuration
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers
COPY . .

# Affiche la liste des fichiers avant le build (pour débogage)
RUN ls -la

# Build l'application
RUN npm run build
