#!/bin/bash

if [ "$1" == "latest" ]; then
  API_VERSION=develop
else
  API_VERSION=v$(node -e "console.log(require('./package.json').catalog_version)")
fi

pushd $HOME
git clone https://github.com/hotosm/oam-catalog.git
cd oam-catalog
if git rev-parse $API_VERSION 2>&1
then
  git checkout $API_VERSION
else
  echo "There isn't an $API_VERSION tag on the oam-catalog repo"
  exit 1
fi
./.build_scripts/prepare_dotenv.sh
# Don't mount the local code into the container
export APP_FROM=container
docker-compose -f test/docker-compose.yml up -d
popd
