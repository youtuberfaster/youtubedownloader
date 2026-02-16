FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy frontend files
COPY index.html style.css script.js ./

EXPOSE 3000

CMD ["node", "server.js"]