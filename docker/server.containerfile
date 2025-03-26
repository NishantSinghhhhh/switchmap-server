# Use a minimal and secure base image for development
FROM python:3.11-slim AS base

# Set up non-root user for security
ARG API_UID=1000
ARG API_GID=1000

# Create a dedicated user and group
RUN groupadd -g ${API_GID} switchmap \
    && useradd -m -u ${API_UID} -g switchmap -s /bin/bash switchmap

# Set working directory
WORKDIR /home/switchmap/api

# Install system dependencies for development
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Switch to non-root user
USER switchmap

# Copy dependency files first for caching
COPY --chown=switchmap:switchmap pyproject.toml poetry.lock ./

# Install Poetry and dependencies
RUN curl -sSL https://install.python-poetry.org | python3 - \
    && export PATH="/home/switchmap/.local/bin:$PATH" \
    && poetry config virtualenvs.create false \
    && poetry install --no-root

# Copy application source code
COPY --chown=switchmap:switchmap . .

# Expose API port
EXPOSE 8000

# Start the server in development mode
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
