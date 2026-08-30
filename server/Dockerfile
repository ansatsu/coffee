FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 3001

# Apply migrations against the db container, then serve
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
