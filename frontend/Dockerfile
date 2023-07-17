# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
ENV NODE_OPTIONS --openssl-legacy-provider
RUN yarn run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80 443
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
