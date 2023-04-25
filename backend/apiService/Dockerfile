FROM node:14-alpine

RUN apk update && apk upgrade && \
apk add --no-cache git

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# COPY .env .env

COPY package*.json ./

RUN npm install

USER node

COPY --chown=node:node . .

EXPOSE 8082

CMD [ "npm", "run", "debug" ]
