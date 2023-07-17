#!/bin/sh
export DOLLAR="$"
envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
# reload to detect ssl certificates changes
while :; do sleep 6h & wait ${!}; nginx -s reload; done & nginx -g "daemon off;"
