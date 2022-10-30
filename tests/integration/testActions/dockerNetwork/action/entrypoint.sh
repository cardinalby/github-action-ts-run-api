#!/bin/bash

echo "$GITHUB_API_URL"
echo "response=$(curl "$GITHUB_API_URL"/repos/cardinalby/github-action-ts-run-api/releases --max-time 3)" >> "$GITHUB_OUTPUT"