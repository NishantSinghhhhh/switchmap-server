# Use a minimal and secure base image for development
FROM node:20-slim AS base

# Set up non-root user for security
ARG API_UID=1000
ARG API_GID=1000

# Create a dedicated user and group
RUN groupadd -g ${API_GID} talawa \
    && useradd -m -u ${API_UID} -g talawa -s /bin/bash talawa

# Set working directory
WORKDIR /home/talawa/api

# Install dependencies for development
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Switch to non-root user
USER talawa

# Copy package files first for better caching
COPY --chown=talawa:talawa package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source code
COPY --chown=talawa:talawa . .

# Expose API port
EXPOSE 7000

# Start the server in development mode
CMD ["pnpm", "dev"]
