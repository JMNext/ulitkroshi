FROM node:22-alpine

WORKDIR /app

# Установка системных зависимостей для сборки (если потребуются нативные модули)
RUN apk add --no-cache python3 make g++

# Копируем манифесты зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci --omit=dev && npm install -g tsx typescript

# Копируем исходный код бэкенда и необходимые конфиги
COPY backend/ ./backend/
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV SERVER_PORT=3005

EXPOSE 3005

CMD ["tsx", "backend/server.ts"]
