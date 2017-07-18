#!/bin/bash

pushd $(git rev-parse --show-toplevel)
DS_ENV=staging NODE_ENV=staging npm run serve &
sleep 30
./node_modules/.bin/wdio test/integration/wdio.browserstack.conf.js
popd
