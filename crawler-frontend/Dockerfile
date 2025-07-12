# Step 1: Build the React app
FROM node:18 AS builder
WORKDIR /app

# Only copy deps first (cache-friendly)
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the source and build
COPY . .
RUN npm run build

# Step 2: Serve with NGINX
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .

# Add custom NGINX config to support React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
