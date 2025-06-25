# Étape 1 : build de l'app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Étape 2 : image finale
FROM node:18

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app ./

# Port attendu par Render (par défaut : 3000)
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
