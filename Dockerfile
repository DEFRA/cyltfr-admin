ARG DEFRA_VERSION=2.5.3
ARG BASE_VERSION=22.14.0-alpine3.21

FROM node:$BASE_VERSION AS production

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

USER root

RUN set -xe \
    && apk update && apk upgrade \
    && apk add bash make gcc g++ py-pip curl npm \
    && bash --version && npm -v && node -v \
    && npm install -g npm \
    && rm -rf /var/cache/apk/* \
    && mkdir /home/node/app \
    && chown -R node:node /home/node/

WORKDIR /home/node/app

USER node

RUN mkdir -p ./node_modules

COPY --chown=root:root ./package*.json ./

COPY --chown=root:root ./bin ./bin

COPY --chown=root:root ./client ./client

COPY --chown=root:root ./index.js .

RUN npm ci --omit=dev

RUN npm run build

COPY --chown=root:root ./server ./server

# COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "index.js" ]