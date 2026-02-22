import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { StartCallClient } from "../clients/twilioClient";

const inputSchema = {
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/)
    .describe("The phone number to dial out to."),
  dtmfSequence: z
    .string()
    .regex(/^([0-9wW],)*[0-9wW]$/)
    .optional()
    .describe(
      "A comma-separated sequence of DTMF digits (0-9) and pauses (w for short pause, W for long pause) to send after the call connects.",
    ),
};

export function registerStartCallTool(server: McpServer, client: StartCallClient): void {
  const handler: ToolCallback<typeof inputSchema> = async ({ phoneNumber, dtmfSequence }) => {
    try {
      const callerId = await client.startCall(phoneNumber, dtmfSequence);
      const result = { callerId };
      return {
        content: [{ type: "text", text: `Call started with ID: ${callerId}` }],
        structuredContent: result,
      };
    } catch {
      return {
        content: [{ type: "text", text: "Failed to start call." }],
        isError: true,
      };
    }
  };

  server.registerTool(
    "StartCall",
    {
      description: "Starts an outbound phone call with a specified phone number.",
      inputSchema,
    },
    handler,
  );
}
