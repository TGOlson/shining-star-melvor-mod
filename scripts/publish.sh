#!/usr/bin/env bash

GAME_ID=2869
MOD_ID=2552914
URL=https://api.mod.io/v1/games/$GAME_ID/mods/$MOD_ID/files

ACCESS_TOKEN=$(cat .env | jq -r .modio_access_token)
VERSION=$(cat manifest.json | jq -r .version)

FILEPATH="dist/shining-star-v$VERSION.zip"
CHANGELOG=$1

echo "Publishing mod version $VERSION"
echo "Access token $ACCESS_TOKEN"

curl -verbose -X POST $URL
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -H "Accept: application/json" \
  -F "filedata=$FILEPATH" \
  -F "version=$VERSION" \
  -F "changelog=$CHANGELOG" \
