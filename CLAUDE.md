# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Model Context Protocol (MCP) server implementation in Go that provides phone call capabilities through Twilio. The server exposes two tools:
- `StartOutboundCall`: Initiates outbound phone calls
- `EndCall`: Ends active phone calls by call ID

## Architecture

The codebase follows a simple three-package structure:

- **main package** (`main.go`): Entry point that creates the MCP server and registers phone call tools using stdio transport
- **tools package** (`tools/`): Defines MCP tool interfaces (`StartOutboundCall`, `EndCall`), including input/output schemas and tool handlers
- **clients package** (`clients/`): Contains phone call client interfaces and implementations:
  - `phone_caller.go`: Defines `CallStarter` and `CallEnder` interfaces
  - `twilio.go`: Implements Twilio client with `StartCall()` and `EndCall()` methods, wraps the Twilio SDK, and handles authentication via environment variables

The MCP server uses the `github.com/modelcontextprotocol/go-sdk` to expose tools to Claude. Each tool follows the pattern:
1. Define tool metadata (`mcp.Tool` struct)
2. Define input/output types with JSON schema tags
3. Implement handler function that takes `context.Context`, `*mcp.CallToolRequest`, and input struct
4. Register tool with server using `mcp.AddTool()`
5. Export an `AddTool*` function to register the tool with the server

## Environment Variables

The server requires three Twilio environment variables at startup (checked in `clients/twilio.go:12-16`):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Missing variables will cause the server to exit on startup with a fatal error.

## Development Commands

**Run the server:**
```bash
go run .
```

**Build binary:**
```bash
go build -o phone-call-mcp-server
```

**Install as MCP server in Claude:**
```bash
./scripts/install_mcp.sh
```
This registers the server with Claude CLI to run via `go run .` with required environment variables.

**Uninstall MCP server:**
```bash
./scripts/uninstall_mcp.sh
```

**Set environment variables (template):**
```bash
source scripts/set_env.sh  # After editing with actual values
```

## Key Implementation Details

- `StartCall` returns a call ID (Twilio SID) that can be used with `EndCall` to terminate the call
- The server currently plays hold music when calls connect (`clients/twilio.go:39`) via a Twilio TwiML URL
- `EndCall` uses Twilio's UpdateCall API with status "completed" to terminate active calls (`clients/twilio.go:46-53`)
- Phone number validation is not yet implemented (see TODOs in `clients/twilio.go:14,34`)
- The Twilio client is created fresh for each tool invocation rather than being reused
- Tool handlers return `(*mcp.CallToolResult, outputStruct, error)` - the first return value is currently unused (nil)
- The `clients/phone_caller.go` defines interfaces (`CallStarter`, `CallEnder`) that allow for different phone call provider implementations

## Adding New Tools

To add a new MCP tool:
1. Create a new file in the `tools/` package
2. Define tool metadata as `&mcp.Tool{Name: "...", Description: "..."}`
3. Define input struct with `json` and `jsonschema` tags
4. Implement handler function matching signature: `func(context.Context, *mcp.CallToolRequest, inputStruct) (*mcp.CallToolResult, outputStruct, error)`
5. Create an `AddTool*` function that calls `mcp.AddTool(server, toolDef, handlerFunc)`
6. Register the tool in `main.go` by calling the `AddTool*` function

See `tools/start_call.go` and `tools/end_call.go` as reference implementations.
