FROM node:20-bullseye-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY src ./src

EXPOSE 3000

# On container start: push the Prisma schema to the DB (creates tables if
# they don't exist yet), then start the server.
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node src/index.js"]
