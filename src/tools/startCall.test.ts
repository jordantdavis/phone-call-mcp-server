import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StartCallClient } from "../clients/twilioClient";
import { registerStartCallTool } from "./startCall";

function setup(client: StartCallClient) {
  let registeredHandler: (...args: Array<unknown>) => unknown;
  const mockServer = {
    registerTool: vi.fn((_name: string, _config: unknown, handler: typeof registeredHandler) => {
      registeredHandler = handler;
    }),
  } as unknown as McpServer;
  registerStartCallTool(mockServer, client);
  return { mockServer, getHandler: () => registeredHandler };
}

describe("registerStartCallTool registration", () => {
  it("registers the tool with correct name and description", () => {
    const client: StartCallClient = { startCall: vi.fn() };
    const { mockServer } = setup(client);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "StartCall",
      expect.objectContaining({
        description: "Starts an outbound phone call with a specified phone number.",
      }),
      expect.any(Function),
    );
  });
});

describe("registerStartCallTool handler", () => {
  let client: StartCallClient;

  beforeEach(() => {
    client = { startCall: vi.fn() };
  });

  it("returns call ID on success", async () => {
    vi.mocked(client.startCall).mockResolvedValue("CA123");
    const { getHandler } = setup(client);

    const result = await getHandler()({ phoneNumber: "5551234567" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Call started with ID: CA123" }],
      structuredContent: { callerId: "CA123" },
    });
  });

  it("passes dtmfSequence to client when provided", async () => {
    vi.mocked(client.startCall).mockResolvedValue("CA456");
    const { getHandler } = setup(client);

    await getHandler()({ phoneNumber: "5551234567", dtmfSequence: "1,2,3" });

    expect(client.startCall).toHaveBeenCalledWith("5551234567", "1,2,3");
  });

  it("returns error content on failure", async () => {
    vi.mocked(client.startCall).mockRejectedValue(new Error("Twilio error"));
    const { getHandler } = setup(client);

    const result = await getHandler()({ phoneNumber: "5551234567" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Failed to start call." }],
      isError: true,
    });
  });
});
