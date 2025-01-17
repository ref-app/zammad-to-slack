FROM node:22.13.0 AS build

LABEL Maintainer="Refapp - https://github.com/ref-app"

WORKDIR /usr/src

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

# Lost --frozen-lockfile: https://github.com/yarnpkg/berry/issues/1803
# Emulate it by doing a full immutable install that might fail, followed by the
# production install that will strip development dependencies.
RUN yarn install --immutable; yarn workspaces focus --all --production

FROM gcr.io/distroless/nodejs22-debian12:nonroot
COPY --from=build /usr/src/node_modules /app/node_modules
COPY main.ts /app/
WORKDIR /app
CMD ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--experimental-strip-types", "main.ts"]
