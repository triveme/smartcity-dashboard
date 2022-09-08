FROM node:14-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY .env .env

COPY ./frontend ./

USER node

RUN npm install
RUN npm install serve
RUN npm run build

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "npx", "serve", "-s", "build" ]
