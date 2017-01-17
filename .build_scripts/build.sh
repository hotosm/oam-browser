#!/usr/bin/env bash
set -e # halt script on error

# If this is the production branch, build it with 
# the production environment, otherwise use staging
if [ $TRAVIS_BRANCH = ${DEPLOY_BRANCH} ]; then
  echo "We're going live with production!"
  npm run build
else
  echo "Building based on staging environment"
  npm run stage
fi