FROM node:22.13.0-alpine3.21

LABEL Maintainer="Refapp - https://github.com/ref-app"

WORKDIR /usr/src

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Lost --frozen-lockfile: https://github.com/yarnpkg/berry/issues/1803
# Emulate it by doing a full immutable install that might fail, followed by the
# production install that will strip development dependencies.
RUN yarn install --immutable
RUN yarn workspaces focus --all --production; yarn cache clean --all

CMD ["yarn","start"]

# These files is most likely to change often so put it last in the Dockerfile for caching reasons
COPY README.md *.ts ./
