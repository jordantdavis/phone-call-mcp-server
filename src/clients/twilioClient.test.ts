import { afterEach, describe, expect, it, vi } from "vitest";
import { loadTwilioConfig, TwilioClient } from "./twilioClient";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("twilio", () => ({
  default: () => ({
    calls: Object.assign((callId: string) => ({ update: mockUpdate.bind(null, callId) }), {
      create: mockCreate,
    }),
  }),
}));

describe("loadTwilioConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns config when all env vars are set", () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "test-sid");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "test-token");
    vi.stubEnv("TWILIO_FROM_NUMBER", "+15551234567");

    const config = loadTwilioConfig();

    expect(config).toEqual({
      accountSid: "test-sid",
      authToken: "test-token",
      fromNumber: "+15551234567",
    });
  });

  it("throws when TWILIO_ACCOUNT_SID is missing", () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "test-token");
    vi.stubEnv("TWILIO_FROM_NUMBER", "+15551234567");

    expect(() => loadTwilioConfig()).toThrow(
      "Required environment variable TWILIO_ACCOUNT_SID is not set.",
    );
  });

  it("throws when TWILIO_AUTH_TOKEN is missing", () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "test-sid");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "");
    vi.stubEnv("TWILIO_FROM_NUMBER", "+15551234567");

    expect(() => loadTwilioConfig()).toThrow(
      "Required environment variable TWILIO_AUTH_TOKEN is not set.",
    );
  });

  it("throws when TWILIO_FROM_NUMBER is missing", () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "test-sid");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "test-token");
    vi.stubEnv("TWILIO_FROM_NUMBER", "");

    expect(() => loadTwilioConfig()).toThrow(
      "Required environment variable TWILIO_FROM_NUMBER is not set.",
    );
  });
});

describe("TwilioClient.startCall", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a call and returns the sid", async () => {
    mockCreate.mockResolvedValue({ sid: "CA123" });
    const client = new TwilioClient({
      accountSid: "test-sid",
      authToken: "test-token",
      fromNumber: "+15551234567",
    });

    const sid = await client.startCall("5551234567");

    expect(sid).toBe("CA123");
    expect(mockCreate).toHaveBeenCalledWith({
      to: "5551234567",
      from: "+15551234567",
      url: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient",
    });
  });

  it("passes sendDigits when dtmfSequence is provided", async () => {
    mockCreate.mockResolvedValue({ sid: "CA456" });
    const client = new TwilioClient({
      accountSid: "test-sid",
      authToken: "test-token",
      fromNumber: "+15551234567",
    });

    const sid = await client.startCall("5551234567", "1,2,3");

    expect(sid).toBe("CA456");
    expect(mockCreate).toHaveBeenCalledWith({
      to: "5551234567",
      from: "+15551234567",
      url: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient",
      sendDigits: "123",
    });
  });
});

describe("TwilioClient.endCall", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates the call status to completed", async () => {
    mockUpdate.mockResolvedValue(null);
    const client = new TwilioClient({
      accountSid: "test-sid",
      authToken: "test-token",
      fromNumber: "+15551234567",
    });

    await client.endCall("CA123");

    expect(mockUpdate).toHaveBeenCalledWith("CA123", { status: "completed" });
  });
});
