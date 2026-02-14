# phone-call-mcp-server

MCP server exposing phone call capabilities via Twilio over stdio transport.

## Tools

### StartCall

Starts an outbound phone call with a specified phone number.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `phoneNumber` | string | Yes | 10-digit phone number to dial. |
| `dtmfSequence` | string | No | Comma-separated sequence of DTMF digits (0-9) and pauses (`w` for short, `W` for long) to send after the call connects. |

### EndCall

Ends an active phone call by its call ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `callId` | string | Yes | The ID of the call to end. |

## Prerequisites

- Node.js
- A Twilio account with:
  - Account SID
  - Auth Token
  - A phone number to use as the caller ID

## Install in Claude Code

```sh
claude mcp add --transport stdio \
  --env TWILIO_ACCOUNT_SID=your_sid \
  --env TWILIO_AUTH_TOKEN=your_token \
  --env TWILIO_FROM_NUMBER=your_number \
  phone-call -- npx -y phone-call-mcp-server
```

## Development

| Script | Description |
|---|---|
| `npm run build` | Bundle with esbuild to `dist/index.js` |
| `npm run dev` | Run directly with tsx (no build step) |
| `npm run start` | Build and run |
| `npm run check` | Lint + format check |
| `npm run typecheck` | Type-check with tsc (no emit) |
| `npm run inspect` | Build and launch MCP Inspector |
