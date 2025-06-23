# Étape 1 : build de l'app
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
ENV NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDH2j-vxDE0VXUwtbhy5GSESSB3D8frh8g
COPY . .
RUN npm run build

# Étape 2 : exécution en production
FROM node:18
WORKDIR /app
COPY --from=builder /app ./
ENV NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDH2j-vxDE0VXUwtbhy5GSESSB3D8frh8g
EXPOSE 3000
CMD ["npm", "start"]