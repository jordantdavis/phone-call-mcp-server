import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const mockEndCall = vi.fn();

vi.mock("../clients/twilioClient", () => ({
  TwilioClient: class {
    endCall = mockEndCall;
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

describe("registerEndCallTool registration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers the tool with correct name and description", async () => {
    const { mockServer } = setup();
    const { registerEndCallTool } = await import("./endCall");
    registerEndCallTool(mockServer);

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
  beforeEach(() => vi.clearAllMocks());

  it("returns success content on successful call end", async () => {
    mockEndCall.mockResolvedValue(null);
    const { mockServer, getHandler } = setup();
    const { registerEndCallTool } = await import("./endCall");
    registerEndCallTool(mockServer);

    const result = await getHandler()({ callId: "CA123" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Call successfully ended." }],
      structuredContent: { success: true },
    });
    expect(mockEndCall).toHaveBeenCalledWith("CA123");
  });

  it("returns error content on failure", async () => {
    mockEndCall.mockRejectedValue(new Error("Twilio error"));
    const { mockServer, getHandler } = setup();
    const { registerEndCallTool } = await import("./endCall");
    registerEndCallTool(mockServer);

    const result = await getHandler()({ callId: "CA123" });

    expect(result).toEqual({
      content: [{ type: "text", text: "Failed to end call." }],
      isError: true,
    });
  });
});
