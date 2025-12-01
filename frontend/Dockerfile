# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies (clean install)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (see Step 4)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the internal Docker network
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]