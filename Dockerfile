FROM node:18-alpine

WORKDIR /app

# Install bash for scripts
RUN apk add --no-cache bash

# Copy server package and install production deps
COPY server/package*.json ./server/
RUN cd server && npm ci --production --silent

# Copy repository files
COPY . .

WORKDIR /app/server

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "index.js"]
