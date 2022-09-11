#!/bin/bash
# SLACK_TOKEN="xoxb-...."
# SLACK_CHANNEL="C012GR10HU4"
apkpath="$1"
files=( ${apkpath}/*.apk )
path_to_file=${files[0]}
filename="${path_to_file##*/}"
base_path="${path_to_file%$filename}"
name_wo_ext=$(basename $path_to_file .apk)
new_filename="${name_wo_ext}-$STAGE.apk"
gitsha=$(git log -n 1 --format="%H")
changelog="commit: $gitsha"

echo "Uploading ${new_filename} (${path_to_file}) to slack"

retries=1
while [[ $retries != 0 ]]; do
  code=$(curl -s https://slack.com/api/files.upload -F token="${SLACK_TOKEN}" -F channels="${SLACK_CHANNEL}" -F title="${new_filename}" -F filename="${new_filename}" -F file=@"${path_to_file}" -F filetype="apk" -F initial_comment="${changelog}" --write-out '%{http_code}' -o tempfile --max-time 120 --limit-rate 5m)
  echo "HTTP $code"
  cat tempfile
  case $code in
    200)
      retries=0
      echo "uploaded successefully!"
      ;;
    *)
      retries=$((retries-1))
      echo "$retries tries left. try again..."
      # sleep 10
      ;;
  esac
done
