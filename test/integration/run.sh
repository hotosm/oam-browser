#!/bin/bash
set -e

pushd $(git rev-parse --show-toplevel)
NODE_ENV=test npm run serve &
sleep 30
BROWSER=$1 ./node_modules/.bin/wdio test/integration/wdio.browserstack.conf.js
popd
