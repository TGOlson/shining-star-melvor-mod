#!/usr/bin/env bash

VERSION=$(cat manifest.json | jq -r .version)

zip dist/shining-star-v$VERSION.zip manifest.json setup.mjs templates.html
