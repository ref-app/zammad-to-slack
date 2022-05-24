A simple web server written in Typescript, nodejs and express to accept inbound webhook calls from Zammad and forward only the event without content to a slack channel

## Running it locally

yarn && yarn start

## Running it in your favourite docker orchestration environment

The docker image is available on public.ecr.aws/refapp/zammad-to-slack:<VERSION>

## Publishing it

./build-docker.sh <docker-hub-user>
or
./ecr-publish-docker.sh <AWS_PROFILE> <ECR_PUBLIC_ALIAS>
