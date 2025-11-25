# phone-call-mcp-server

A Model Context Protocol (MCP) server that provides phone call capabilities to Claude and other MCP clients through Twilio integration.

## Overview

This MCP server enables AI assistants like Claude to make and manage phone calls programmatically. It exposes two core tools:

- **StartCall**: Initiate outbound phone calls to any phone number, with optional DTMF (touch-tone) sequences.
- **EndCall**: Terminate active phone calls using their call ID.

The server is built in Go and uses the Twilio API for telephony operations.

## Features

- Start outbound phone calls to any valid phone number.
- Send DTMF sequences after call connection (useful for navigating IVR systems).
- End active calls programmatically.
- Returns Twilio call SIDs for tracking and management.
- Simple stdio-based MCP transport for easy integration.

## Installation

### Prerequisites

- Go 1.25.3 or later
- Twilio account with:
  - Account SID
  - Auth Token
  - Twilio phone number

### Setup

1. Clone the repository:
```bash
git clone https://github.com/jordantdavis/phone-call-mcp-server.git
cd phone-call-mcp-server
```

2. Set up environment variables (copy and edit `scripts/set_env.sh` with your Twilio credentials):
```bash
source scripts/set_env.sh
```

3. Install as an MCP server in Claude:
```bash
./scripts/cc_install.sh
```

## Usage

Once installed, Claude can use the phone call tools in conversations:

**Making a call:**
```
Claude, please call +1-555-123-4567.
```

**Making a call with DTMF sequence:**
```
Claude, call +1-555-123-4567 and press 1, then 2, then 3 after it connects.
```

**Ending a call:**
```
Claude, end the call with ID CA1234567890abcdef1234567890abcdef.
```

## Development

### Run the server locally:
```bash
go run .
```

### Build binary:
```bash
go build -o phone-call-mcp-server
```

### Test with MCP Inspector:
```bash
./scripts/inspect.sh
```

### Uninstall from Claude:
```bash
./scripts/cc_uninstall.sh
```

## Architecture

The codebase is organized into three main packages:

- **main**: Server initialization and tool registration.
- **tools**: MCP tool definitions and handlers.
- **clients**: Phone call client interfaces and Twilio implementation.

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.
