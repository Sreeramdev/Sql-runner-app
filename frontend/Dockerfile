# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

# Build the app
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for SPA with production settings
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    \n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Enable gzip compression\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;\n\
    \n\
    # Handle SPA routing\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # Cache static assets\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    \n\
    # Security headers\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header X-XSS-Protection "1; mode=block" always;\n\
    }\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
