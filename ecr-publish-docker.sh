#!/usr/bin/env bash
# depends on awsudo from https://github.com/makethunder/awsudo
set -eo pipefail

function getRegion() {
    echo $AWS_DEFAULT_REGION
}

AWS_ECR_PROFILE=${1:-refapp-devresources-admin}

AWS_ECR_ACCOUNT_ID=$(awsudo -u ${AWS_ECR_PROFILE} aws sts get-caller-identity --query "Account" --output text)
AWS_DEFAULT_REGION=$(awsudo -u ${AWS_ECR_PROFILE} bash -c 'echo `echo $AWS_DEFAULT_REGION`')
export ECR_URL="${AWS_ECR_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
echo $ECR_URL
awsudo -u ${AWS_ECR_PROFILE} bash -c 'aws ecr get-login-password|docker login --username AWS --password-stdin "$ECR_URL" && ./build-docker.sh "$ECR_URL"'
# 
# 