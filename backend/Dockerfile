FROM node:18-alpine

WORKDIR /app

# Copy package configurations and install
COPY package*.json ./
RUN npm install

# Copy Prisma schema first for client code generation
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

EXPOSE 5000

# Run migrations and start the Express server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
