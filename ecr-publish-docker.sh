#!/usr/bin/env bash
# depends on awsudo from https://github.com/makethunder/awsudo
set -eo pipefail

# These are our settings, customise to your own needs by passing in command line arguments
AWS_ECR_PROFILE=${1:-refapp-devresources-admin}
AWS_ECR_REGISTRY_ALIAS=${2:-refapp}

export ECR_PUBLIC_REPO_ROOT=public.ecr.aws/${AWS_ECR_REGISTRY_ALIAS}
echo "Logging in and pushing to $ECR_PUBLIC_REPO_ROOT"
awsudo -u ${AWS_ECR_PROFILE} bash -c 'aws ecr-public get-login-password --region us-east-1|docker login --username AWS --password-stdin public.ecr.aws && ./build-docker.sh "$ECR_PUBLIC_REPO_ROOT"'
