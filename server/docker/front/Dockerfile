FROM node:21-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && \
	corepack prepare pnpm@8.15.9 --activate

COPY front /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:1.24.0-alpine
COPY docker/front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /front