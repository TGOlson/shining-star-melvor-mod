#!/usr/bin/env bash

VERSION=$(cat manifest.json | jq -r .version)

echo "Building mod version $VERSION"

zip -r dist/shining-star-v$VERSION.zip manifest.json setup.mjs templates.html assets

echo $VERSION
