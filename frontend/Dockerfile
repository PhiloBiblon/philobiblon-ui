# build stage
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package.json .yarnrc.yml ./
ARG BASE_URL
ARG API_BASE_URL
ENV BASE_URL=$BASE_URL
ENV API_BASE_URL=$API_BASE_URL
RUN yarn install
COPY . .
RUN yarn run generate

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
