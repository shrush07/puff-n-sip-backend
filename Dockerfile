FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

# Confirm dist exists (debug safety)
RUN ls -la dist

EXPOSE 3000

CMD ["node", "dist/server.js"]