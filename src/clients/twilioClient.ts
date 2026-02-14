import twilio from "twilio";

const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
const authToken = requireEnv("TWILIO_AUTH_TOKEN");
const fromNumber = requireEnv("TWILIO_FROM_NUMBER");

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set.`);
  }
  return value;
}

export class TwilioClient {
  private client: ReturnType<typeof twilio>;

  constructor() {
    this.client = twilio(accountSid, authToken);
  }

  async startCall(phoneNumber: string, dtmfSequence?: string): Promise<string> {
    const sendDigits = dtmfSequence ? dtmfSequence.replaceAll(",", "") : undefined;

    const call = await this.client.calls.create({
      to: phoneNumber,
      from: fromNumber,
      url: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient",
      ...(sendDigits && { sendDigits }),
    });

    return call.sid;
  }

  async endCall(callId: string): Promise<void> {
    await this.client.calls(callId).update({ status: "completed" });
  }
}
