import twilio from "twilio";

export interface StartCallClient {
  startCall(phoneNumber: string, dtmfSequence?: string): Promise<string>;
}

export interface EndCallClient {
  endCall(callId: string): Promise<void>;
}

interface TwilioClientConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set.`);
  }
  return value;
}

export function loadTwilioConfig(): TwilioClientConfig {
  return {
    accountSid: requireEnv("TWILIO_ACCOUNT_SID"),
    authToken: requireEnv("TWILIO_AUTH_TOKEN"),
    fromNumber: requireEnv("TWILIO_FROM_NUMBER"),
  };
}

export class TwilioClient implements StartCallClient, EndCallClient {
  private client: ReturnType<typeof twilio>;
  private fromNumber: string;

  constructor(config: TwilioClientConfig) {
    this.client = twilio(config.accountSid, config.authToken);
    this.fromNumber = config.fromNumber;
  }

  async startCall(phoneNumber: string, dtmfSequence?: string): Promise<string> {
    const sendDigits = dtmfSequence ? dtmfSequence.replaceAll(",", "") : undefined;

    const call = await this.client.calls.create({
      to: phoneNumber,
      from: this.fromNumber,
      url: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient",
      ...(sendDigits && { sendDigits }),
    });

    return call.sid;
  }

  async endCall(callId: string): Promise<void> {
    await this.client.calls(callId).update({ status: "completed" });
  }
}
