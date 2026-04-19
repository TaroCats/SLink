# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
# Use the build platform (e.g., linux/amd64) to run the compiler, avoiding QEMU emulation overhead
FROM --platform=$BUILDPLATFORM rust:alpine AS backend-builder
ARG TARGETARCH
WORKDIR /app/api

# Install C compiler tools required for compiling sqlite3-sys
RUN apk add --no-cache musl-dev build-base

# Add cross-compilation target and linker based on TARGETARCH
RUN case "$TARGETARCH" in \
        "amd64") \
            rustup target add x86_64-unknown-linux-musl && \
            echo "export RUST_TARGET=x86_64-unknown-linux-musl" > /env.sh \
            ;; \
        "arm64") \
            apk add --no-cache gcc-aarch64-none-elf && \
            rustup target add aarch64-unknown-linux-musl && \
            echo "export RUST_TARGET=aarch64-unknown-linux-musl" > /env.sh && \
            echo "[target.aarch64-unknown-linux-musl]" >> $CARGO_HOME/config.toml && \
            echo "linker = \"aarch64-none-elf-gcc\"" >> $CARGO_HOME/config.toml && \
            echo "export CC_aarch64_unknown_linux_musl=aarch64-none-elf-gcc" >> /env.sh \
            ;; \
        *) \
            echo "Unsupported architecture: $TARGETARCH" && exit 1 \
            ;; \
    esac

# Copy source code and build the final binary
COPY api .
RUN . /env.sh && cargo build --release --target $RUST_TARGET --bin api
RUN . /env.sh && cp target/$RUST_TARGET/release/api /tmp/api-bin

# Stage 3: Final Runtime Image
FROM alpine:latest
WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
# Install runtime dependencies (CA certs for HTTPS requests, libgcc for C binaries)
RUN apk update && apk add --no-cache ca-certificates libgcc

# Copy backend binary
COPY --from=backend-builder /tmp/api-bin /usr/local/bin/slink-api

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