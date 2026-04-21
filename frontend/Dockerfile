# build stage
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package.json ./
ARG BASE_URL
ARG API_BASE_URL
RUN yarn install
COPY . .
RUN yarn run generate

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/.output/public /usr/share/nginx/html
EXPOSE 80 443
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
