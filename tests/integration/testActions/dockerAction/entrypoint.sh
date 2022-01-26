#!/bin/bash

echo "::set-output name=out1::$1"

if [ "$INPUT_ACTION" == "sleep" ]; then
  sleep 1
fi
if [ "$INPUT_ACTION" == "fail" ]; then
  exit 2
fi
if [ "$INPUT_ACTION" == "user_out" ]; then
  echo "::set-output name=user_out::$(id -u):$(id -g)"
fi

echo "::set-output name=out2::$INPUT_INPUT2"
echo "::set-output name=pwd_out::$(pwd)"
echo "::set-output name=workspace_out::$GITHUB_WORKSPACE"

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
  echo "::set-output name=out_pr_num::$(< "$GITHUB_EVENT_PATH" jq '.pull_request.number')"
fi