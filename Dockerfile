FROM node:16-alpine3.14

LABEL Maintainer "Refapp - https://github.com/ref-app"

WORKDIR /usr/src

COPY package.json yarn.lock ./

RUN yarn --production --frozen-lockfile; yarn cache clean

CMD ["yarn","start"]

# These files is most likely to change often so put it last in the Dockerfile for caching reasons
COPY README.md *.ts ./
