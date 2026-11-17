
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Confirm dist exists
RUN ls -la dist

EXPOSE 3000 5000

CMD ["node", "dist/server.js"]
