# deps stage: node_modules + source, no Nuxt build — shared by build-stage and quicksearch-registrar
FROM node:22-alpine AS deps-stage
WORKDIR /app
COPY package.json .yarnrc.yml ./
RUN corepack enable && yarn install
COPY . .

# build stage
FROM deps-stage AS build-stage
ARG BASE_URL
ARG API_BASE_URL
ENV BASE_URL=$BASE_URL
ENV API_BASE_URL=$API_BASE_URL
RUN yarn run generate

# quicksearch-registrar stage: one-shot container that registers/refreshes QuickSearch filter
# templates with the backend on every deploy (see scripts/register-quicksearch-filters.mjs).
# Built from deps-stage so it doesn't carry the Nuxt build output.
FROM deps-stage AS quicksearch-registrar
CMD ["node", "scripts/register-quicksearch-filters.mjs"]

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/.output/public /usr/share/nginx/html
# Create a default nginx configuration template
RUN echo 'server {\n\
    listen 80;\n\
    server_tokens off;\n\
\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files ${DOLLAR}uri ${DOLLAR}uri/ /index.html;\n\
    }\n\
\n\
    location = /api/search/quick/register {\n\
        return 403;\n\
    }\n\
\n\
    location ~ ^/(api|w|\\./w)(/|${DOLLAR}) {\n\
        proxy_pass http://backend:8080;\n\
        proxy_set_header Host ${DOLLAR}host;\n\
        proxy_set_header X-Real-IP ${DOLLAR}remote_addr;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf.template
EXPOSE 80 443
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
