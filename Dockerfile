FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/prisma ./prisma/
COPY server/prisma.config.ts ./
RUN npx prisma generate

COPY server/ .

EXPOSE 8080

CMD ["node", "server.js"]
