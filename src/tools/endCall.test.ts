import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { EndCallClient } from "../clients/twilioClient";
import { registerEndCallTool } from "./endCall";

function setup(client: EndCallClient) {
  let registeredHandler: (...args: Array<unknown>) => unknown;
  const mockServer = {
    registerTool: vi.fn((_name: string, _config: unknown, handler: typeof registeredHandler) => {
      registeredHandler = handler;
    }),
  } as unknown as McpServer;
  registerEndCallTool(mockServer, client);
  return { mockServer, getHandler: () => registeredHandler };
}

describe("registerEndCallTool registration", () => {
  it("registers the tool with correct name and description", () => {
    const client: EndCallClient = { endCall: vi.fn() };
    const { mockServer } = setup(client);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "EndCall",
      expect.objectContaining({
        description: "Ends an active phone call by its call ID.",
      }),
      expect.any(Function),
    );
  });
});

describe("registerEndCallTool handler", () => {
  let client: EndCallClient;

  beforeEach(() => {
    client = { endCall: vi.fn() };
  });

  it("returns success content on successful call end", async () => {
    vi.mocked(client.endCall).mockResolvedValue();
    const { getHandler } = setup(client);

    const result = await getHandler()({ callId: "CA123" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Call successfully ended." }],
      structuredContent: { success: true },
    });
    expect(client.endCall).toHaveBeenCalledWith("CA123");
  });

  it("returns error content on failure", async () => {
    vi.mocked(client.endCall).mockRejectedValue(new Error("Twilio error"));
    const { getHandler } = setup(client);

    const result = await getHandler()({ callId: "CA123" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Failed to end call." }],
      isError: true,
    });
  });
});
