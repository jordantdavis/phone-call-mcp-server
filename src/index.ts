import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerStartCallTool } from "./tools/startCall";
import { registerEndCallTool } from "./tools/endCall";

const server = new McpServer({ name: "phone-call", version: "0.0.1" });

registerStartCallTool(server);
registerEndCallTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);
