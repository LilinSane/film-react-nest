FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM alpine:3.21 AS dist-exporter

COPY --from=builder /app/dist/ /dist/

CMD ["sh", "-c", "mkdir -p /usr/share/nginx/html && find /usr/share/nginx/html -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && cp -a /dist/. /usr/share/nginx/html/"]
