import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EndCallClient } from "../clients/twilioClient";

const inputSchema = {
  callId: z.string().min(1).describe("The ID of the call to end."),
};

export function registerEndCallTool(server: McpServer, client: EndCallClient): void {
  const handler: ToolCallback<typeof inputSchema> = async ({ callId }) => {
    try {
      await client.endCall(callId);
      const result = { success: true };
      return {
        content: [{ type: "text", text: "Call successfully ended." }],
        structuredContent: result,
      };
    } catch {
      return {
        content: [{ type: "text", text: "Failed to end call." }],
        isError: true,
      };
    }
  };

  server.registerTool(
    "EndCall",
    {
      description: "Ends an active phone call by its call ID.",
      inputSchema,
    },
    handler,
  );
}
