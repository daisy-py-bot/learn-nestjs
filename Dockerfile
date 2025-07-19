# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install all dependencies including devDependencies for the build
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Stage 2: Run
FROM node:18-alpine

WORKDIR /app

# Copy only built code and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

ENV NODE_ENV=production

CMD ["node", "dist/main"]
