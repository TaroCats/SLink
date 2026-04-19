# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Base Rust Image for caching cargo-chef
FROM rust:alpine AS rust-base
WORKDIR /app/api
# Install C compiler tools required for compiling sqlite3-sys
RUN apk add --no-cache musl-dev build-base
RUN cargo install cargo-chef

# Stage 3: Prepare Recipe
FROM rust-base AS planner
COPY api .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 4: Build Backend
FROM rust-base AS backend-builder
# Copy recipe and build dependencies only (this layer is cached if Cargo.toml doesn't change)
COPY --from=planner /app/api/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Copy source code and build the final binary
COPY api .
RUN cargo build --release --bin api

# Stage 5: Final Runtime Image
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