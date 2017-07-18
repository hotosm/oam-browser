#!/bin/bash

if [ "$1" == "latest" ]; then
  API_VERSION=develop
else
  API_VERSION=$(node -e "console.log(require('./package.json').catalog_version)")
fi

pushd $HOME
git clone https://github.com/hotosm/oam-catalog.git
cd oam-catalog
git checkout $API_VERSION
docker-compose -f test/docker-compose.yml up -d
popd
