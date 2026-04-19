# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Rust Dependencies caching with cargo-chef
FROM rust:alpine AS planner
WORKDIR /app/api
RUN apk add --no-cache musl-dev
RUN cargo install cargo-chef
COPY api .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 3: Build Backend
FROM rust:alpine AS backend-builder
WORKDIR /app/api
RUN apk add --no-cache musl-dev pkgconfig openssl-dev openssl-libs-static sqlite-dev
RUN cargo install cargo-chef
# Copy recipe and build dependencies only (this layer is cached if Cargo.toml doesn't change)
COPY --from=planner /app/api/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Copy source code and build the final binary
COPY api .
RUN cargo build --release --bin api

# Stage 4: Final Runtime Image
FROM alpine:3.19
WORKDIR /app

# Install runtime dependencies (OpenSSL, SQLite, CA certs)
RUN apk add --no-cache libgcc libstdc++ openssl sqlite-libs ca-certificates

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