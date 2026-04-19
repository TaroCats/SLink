# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
# Use the native platform to compile instead of complicated cross-compilation toolchains.
# QEMU emulation is much better now since we've stripped cargo-chef and OpenSSL.
FROM rust:alpine AS backend-builder
WORKDIR /app/api

# Install C compiler tools required for compiling sqlite3-sys
RUN apk add --no-cache musl-dev build-base

# Copy source code and build the final binary
COPY api .
RUN cargo build --release --bin api

# Stage 3: Final Runtime Image
FROM alpine:latest
WORKDIR /app

# Install runtime dependencies (CA certs for HTTPS requests, libgcc for C binaries)
RUN apk update && apk add --no-cache ca-certificates libgcc

# Copy backend binary
COPY --from=backend-builder /app/api/target/release/api /usr/local/bin/slink-api

# Copy frontend static files into a directory the backend can serve
COPY --from=frontend-builder /app/dist /app/public

# Copy database migrations
COPY --from=backend-builder /app/api/migrations /app/migrations

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment variables
ENV DATABASE_URL="sqlite:///app/data/shortlink.db"
ENV RUST_LOG="info"
# Listen on all interfaces
ENV BIND_ADDRESS="0.0.0.0:8080"

EXPOSE 8080

CMD ["slink-api"]