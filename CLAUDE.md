# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server that exposes phone call capabilities via Twilio. It provides two tools — `StartCall` and `EndCall` — over stdio transport.

## Commands

- `npm run build` — Bundle with esbuild to `dist/index.js`
- `npm run dev` — Run directly with tsx (no build step)
- `npm run start` — Build and run
- `npm run lint` — Lint with oxlint
- `npm run lint:fix` — Lint and auto-fix
- `npm run format` — Format with oxfmt
- `npm run format:check` — Check formatting
- `npm run check` — Lint + format check
- `npm run typecheck` — Type-check with tsc (no emit)
- `npm run inspect` — Build and launch MCP Inspector

## Architecture

- `src/index.ts` — Entry point. Creates `McpServer`, registers tools, connects stdio transport.
- `src/tools/` — Each tool is a separate file exporting a `register*Tool(server)` function. Tools define a Zod input schema and a handler, then call `server.registerTool()`.
- `src/clients/twilioClient.ts` — `TwilioClient` class wrapping the Twilio SDK. Reads `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` from environment variables (required).

## Code Conventions

- ESM (`"type": "module"`) with `verbatimModuleSyntax` — use `import type` for type-only imports
- Zod v4 for input validation
- Strict TypeScript: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Linting: oxlint with typescript/import/unicorn plugins. Key rules: no `any`, no non-null assertions, consistent type imports, no `console.log`, `eqeqeq`, `prefer-const`, prefer `node:` protocol for Node built-ins
- Formatting: oxfmt with double quotes, semicolons, trailing commas, LF line endings
