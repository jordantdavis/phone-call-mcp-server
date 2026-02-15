import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const mockStartCall = vi.fn();

vi.mock("../clients/twilioClient", () => ({
  TwilioClient: class {
    startCall = mockStartCall;
  },
}));

function setup() {
  let registeredHandler: (...args: Array<unknown>) => unknown;
  const mockServer = {
    registerTool: vi.fn((_name: string, _config: unknown, handler: typeof registeredHandler) => {
      registeredHandler = handler;
    }),
  } as unknown as McpServer;
  return { mockServer, getHandler: () => registeredHandler };
}

describe("registerStartCallTool registration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers the tool with correct name and description", async () => {
    const { mockServer } = setup();
    const { registerStartCallTool } = await import("./startCall");
    registerStartCallTool(mockServer);

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
  beforeEach(() => vi.clearAllMocks());

  it("returns call ID on success", async () => {
    mockStartCall.mockResolvedValue("CA123");
    const { mockServer, getHandler } = setup();
    const { registerStartCallTool } = await import("./startCall");
    registerStartCallTool(mockServer);

    const result = await getHandler()({ phoneNumber: "5551234567" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Call started with ID: CA123" }],
      structuredContent: { callerId: "CA123" },
    });
  });

  it("passes dtmfSequence to TwilioClient when provided", async () => {
    mockStartCall.mockResolvedValue("CA456");
    const { mockServer, getHandler } = setup();
    const { registerStartCallTool } = await import("./startCall");
    registerStartCallTool(mockServer);

    await getHandler()({ phoneNumber: "5551234567", dtmfSequence: "1,2,3" });

    expect(mockStartCall).toHaveBeenCalledWith("5551234567", "1,2,3");
  });

  it("returns error content on failure", async () => {
    mockStartCall.mockRejectedValue(new Error("Twilio error"));
    const { mockServer, getHandler } = setup();
    const { registerStartCallTool } = await import("./startCall");
    registerStartCallTool(mockServer);

    const result = await getHandler()({ phoneNumber: "5551234567" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Failed to start call." }],
      isError: true,
    });
  });
});
