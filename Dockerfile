FROM node:24.12.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy only package files first for better caching
COPY package.json package-lock.json* ./

RUN npm ci

# Copy source
COPY . .

RUN npm run build

# Expose default port (app should listen on 3000 by default)
EXPOSE 8000

# Default command for startup; docker-compose can override
CMD ["npm", "start"]
