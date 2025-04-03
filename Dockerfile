ARG PARENT_VERSION=2.5.3-node22.14.0

FROM ghcr.io/osgeo/gdal:alpine-small-${PARENT_VERSION} AS base
ARG PORT=3000
ENV PORT ${PORT}

USER root

RUN set -xe \
    && apk update && apk upgrade \
    && apk add bash make gcc g++ py-pip curl npm \
    && rm -rf /var/cache/apk/* \
    && addgroup -S node \
    && adduser -S -D -G node node \
    && mkdir /home/node/app \
    && chown -R node:node /home/node/

WORKDIR /home/node/app

COPY --chown=root:root ./package*.json ./

COPY --chown=root:root ./index.js .

FROM base AS development

RUN npm ci --ignore-scripts --include dev

COPY --chown=root:root ./server ./server

EXPOSE ${PORT} 9229 9230

USER node

CMD [ "node", "index.js" ]

FROM base AS production

RUN npm ci --ignore-scripts --omit dev

COPY --chown=root:root ./server/*.js ./server/
COPY --chown=root:root ./server/plugins/*.js ./server/plugins/
COPY --chown=root:root ./server/routes/*.js ./server/routes/
COPY --chown=root:root ./server/providers/*.js ./server/providers/

EXPOSE ${PORT}

USER node

HEALTHCHECK --timeout=5s CMD curl --fail http://localhost:${PORT}/healthcheck || exit 1

CMD [ "node", "index.js" ]
