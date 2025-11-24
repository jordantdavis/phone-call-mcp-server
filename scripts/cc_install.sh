#!/bin/bash

claude mcp add phone-call \
  --transport stdio \
  --env TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID" \
  --env TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN" \
  --env TWILIO_FROM_NUMBER="$TWILIO_FROM_NUMBER" \
  -- go run .
