#!/usr/bin/env bash
node-sass-chokidar \
  --include-path ./src \
  --include-path ./node_modules/bourbon/app/assets/stylesheets/ \
  --include-path ./node_modules/bourbon-neat/app/assets/stylesheets/ \
  --include-path ./node_modules/jeet/scss/ \
  src/ -o src/
