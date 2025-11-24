#!/bin/bash

npx @modelcontextprotocol/inspector \
  -e TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID" \
  -e TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN" \
  -e TWILIO_FROM_NUMBER="$TWILIO_FROM_NUMBER" \
  go run ..
