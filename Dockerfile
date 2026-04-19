# Stage 1: Final Runtime Image
FROM alpine:latest
WORKDIR /app
ARG TARGETARCH

# Install runtime dependencies (CA certs for HTTPS requests, libgcc for C binaries)
RUN apk update && apk add --no-cache ca-certificates libgcc

# Copy pre-compiled backend binary based on TARGETARCH
# The binary is expected to be built externally and placed in the appropriate directory
COPY dist-bin/api-${TARGETARCH} /usr/local/bin/slink-api

# Copy pre-compiled frontend static files
COPY dist-frontend /app/public

# Copy database migrations
COPY api/migrations /app/migrations

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment variables
ENV DATABASE_URL="sqlite:///app/data/shortlink.db"
ENV RUST_LOG="info"
# Listen on all interfaces
ENV BIND_ADDRESS="0.0.0.0:8080"

EXPOSE 8080

CMD ["slink-api"]