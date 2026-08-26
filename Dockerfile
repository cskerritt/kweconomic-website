FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
# Resilience against transient registry stalls: a 2026-06-18 build hung in
# `npm ci` for ~51 min then timed out (no code change - the same lockfile built
# fine 12h earlier). Skip the audit/fund network calls (a known hang source) and
# retry tarball fetches with backoff instead of stalling indefinitely.
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm ci --no-audit --no-fund

COPY . .

# Build-time public vars. Vite inlines import.meta.env.VITE_* during the build,
# so they must be present for `npm run build`. The Turnstile SITE key is public
# (it ships in client JS; only TURNSTILE_SECRET_KEY is secret), so we bake the
# real key in as the default rather than "". Relying on Railway to forward a
# service variable as a --build-arg proved unreliable (Docker layer caching left
# `npm run build` cached with an empty key, so the widget was tree-shaken out).
# Railway can still override this via a matching service-variable build-arg.
ARG VITE_TURNSTILE_SITE_KEY="0x4AAAAAADmmzXH9KTZuCEUg"
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

# Public GA4 measurement id (like the Turnstile SITE key, it ships in client JS).
# Empty default keeps analytics DORMANT; set this build-arg (Railway service var)
# to a real G-XXXX id to activate site-wide analytics. Vite inlines it at build.
ARG VITE_GA_MEASUREMENT_ID="G-C1QFJ39WL2"
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.js validation.server.mjs turnstile.server.mjs ./
COPY lib ./lib
# Create the runtime data dir and hand the app to the built-in non-root `node`
# user (node:alpine ships one). data/ must be node-owned so submission
# breadcrumbs can be written without running as root.
RUN mkdir -p data && chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "server.js"]
