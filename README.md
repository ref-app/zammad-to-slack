A simple web server written in Typescript, nodejs and express to accept inbound webhook calls from Zammad and forward only the event without content to a slack channel

## Developing

This will restart on file changes and report on TypeScript errors.

```sh
fnm use
yarn install
yarn dev
```

## Running it locally

This will not restart for file changes and will ignore TypeScript.

```sh
fnm use
yarn install
yarn start
```

If you want to exclude development dependencies completely, run:

```sh
yarn workspaces focus --all --production
```

## Running it locally with Docker

```sh
docker build -t zammad-to-slack .
docker run -d -p 8000:8000 zammad-to-slack
```

## Running it in your favourite docker orchestration environment

The docker image is available on public.ecr.aws/refapp/zammad-to-slack:<VERSION>

## Publishing it

./build-docker.sh <docker-hub-user>
or
./ecr-publish-docker.sh <AWS_PROFILE> <ECR_PUBLIC_ALIAS>
