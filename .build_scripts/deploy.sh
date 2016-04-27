#!/usr/bin/env bash
set -e # halt script on error

echo "Get ready, we're pushing to gh-pages!"
cd dist
git init
git config user.name "Travis-CI"
git config user.email "travis@somewhere.com"
git add .
git commit -m "CI deploy to gh-pages"
git push --force --quiet "https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git" master:gh-pages
