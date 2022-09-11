#!/bin/bash

if [ -z "$SLACK_SHAONLY" ]
then
tags=($(git tag -l --sort=v:refname))
changelog="ConnectClub IOS *${tags[${#tags[@]}-1]}* changelog:
$(git log --oneline ${tags[${#tags[@]}-2]}..${tags[${#tags[@]}-1]})
"
else
changelog="ConnectClub IOS from commit $(git log -n 1 --format="%H")"
fi

curl -s -X POST -H 'Content-type: application/json' \
  --data "{\"text\": \"$changelog\"}" \
  $SLACK_WEBHOOK_URL
