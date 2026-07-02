# Optimus API Server — Docker image
# Uses Bun runtime, exposes port 3001

FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY src/ ./src/
COPY tsconfig.json ./

# Start the server
EXPOSE 3001
ENV PORT=3001
CMD ["bun", "run", "src/server.ts"]
