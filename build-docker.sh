#!/usr/bin/env bash
DOCKERHUB_USER=${1:-perbergland}

VERSION=$(jq -r .version <package.json)
APP=$(jq -r .name <package.json)
TAG="${APP}:${VERSION}"
docker buildx build --platform linux/amd64 --push -t "${DOCKERHUB_USER}/${TAG}" .
