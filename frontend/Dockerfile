# --- STAGE 1: BUILD REACT STATIC ASSETS ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Install npm dependencies
RUN npm ci

# Copy client source code
COPY . .

# Build production React distribution bundle (outputs to /app/dist)
RUN npm run build

# --- STAGE 2: HIGH PERFORMANCE NGINGX WEB SERVING ---
FROM nginx:stable-alpine

# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static distribution files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
