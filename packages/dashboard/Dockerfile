# Optimus Dashboard — Next.js Docker image
# Uses Node 24, exposes port 3000

FROM node:24-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Start in production mode
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
