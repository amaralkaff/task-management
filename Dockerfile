# Tahap Build
FROM node:18-alpine AS builder

# Set direktori kerja
WORKDIR /app

# Salin file yang diperlukan untuk build
COPY package*.json tsconfig.json ./

# Install dependensi build yang diperlukan
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    npm ci --only=development

# Salin file sumber
COPY src ./src

# Build TypeScript
RUN npm run build

# Tahap Production
FROM node:18-alpine

WORKDIR /app

# Salin dependensi production
COPY package*.json ./
RUN npm ci --only=production

# Salin file hasil build dan konfigurasi yang diperlukan
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./

# Buat direktori uploads
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Perintah start dengan ES modules
CMD ["node", "--experimental-specifier-resolution=node", "--es-module-specifier-resolution=node", "dist/index.js"]