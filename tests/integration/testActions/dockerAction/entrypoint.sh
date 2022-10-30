#!/bin/bash

echo "out1=$1" >> "$GITHUB_OUTPUT"

if [ "$INPUT_ACTION" == "sleep" ]; then
  sleep 1
fi
if [ "$INPUT_ACTION" == "fail" ]; then
  exit 2
fi
if [ "$INPUT_ACTION" == "user_out" ]; then
  echo "::set-output name=user_out::$(id -u):$(id -g)"
fi

# shellcheck disable=SC2129
echo "out2=$INPUT_INPUT2" >> "$GITHUB_OUTPUT"
echo "pwd_out=$(pwd)" >> "$GITHUB_OUTPUT"
echo "workspace_out=$GITHUB_WORKSPACE" >> "$GITHUB_OUTPUT"

echo "my_path" >> "$GITHUB_PATH"
{
  echo "var1=val1"
  echo "var2<<delim"
  echo "val2"
  echo "delim"
} >> "$GITHUB_ENV"

echo -n "temp" > "$RUNNER_TEMP/t.txt"
echo -n "ws" > "$GITHUB_WORKSPACE/w.txt"

if [ -f "$GITHUB_EVENT_PATH" ]; then
  echo "out_pr_num=$(< "$GITHUB_EVENT_PATH" jq '.pull_request.number')" >> "$GITHUB_OUTPUT"
fi