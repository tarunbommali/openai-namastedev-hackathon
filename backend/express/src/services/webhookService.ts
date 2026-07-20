import crypto from "crypto";
import axios from "axios";
import { WebhookSubscription } from "../models/WebhookSubscription";
import { encryptSecret, decryptSecret } from "../utils/cryptoUtils";

export interface IWebhookPayload {
  event: "job.created" | "candidate.screened" | "decision.made" | "offer.sent";
  tenantId: string;
  timestamp: string;
  data: Record<string, any>;
}

export class WebhookService {
  /**
   * Dispatch outbound webhook event to registered subscriber URLs for a tenant
   */
  static async dispatchEvent(
    event: "job.created" | "candidate.screened" | "decision.made" | "offer.sent",
    tenantId: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const subscriptions = await WebhookSubscription.find({
        tenantId,
        events: event,
        isActive: true
      });

      if (!subscriptions || subscriptions.length === 0) {
        return;
      }

      const timestamp = new Date().toISOString();
      const payload: IWebhookPayload = {
        event,
        tenantId,
        timestamp,
        data
      };

      const payloadString = JSON.stringify(payload);

      for (const sub of subscriptions) {
        const decryptedSecret = decryptSecret(sub.secret);
        const signature = crypto
          .createHmac("sha256", decryptedSecret)
          .update(payloadString)
          .digest("hex");

        axios
          .post(sub.url, payload, {
            headers: {
              "Content-Type": "application/json",
              "X-HireFlow-Signature": `t=${timestamp},v1=${signature}`,
              "User-Agent": "HireFlow-AI-Webhook/2.0"
            },
            timeout: 5000
          })
          .catch((err) => {
            console.warn(`[WebhookService] Delivery failed for ${sub.url}: ${err.message}`);
          });
      }
    } catch (error: any) {
      console.error(`[WebhookService] Error dispatching event ${event}: ${error.message}`);
    }
  }

  /**
   * Create or update webhook subscription for a tenant
   */
  static async registerWebhook(
    tenantId: string,
    url: string,
    events: Array<"job.created" | "candidate.screened" | "decision.made" | "offer.sent">,
    secret?: string
  ) {
    const existing = await WebhookSubscription.findOne({ tenantId, url });
    const rawSecret = secret || crypto.randomBytes(24).toString("hex");
    const encryptedSecret = encryptSecret(rawSecret);

    if (existing) {
      existing.events = events;
      existing.secret = encryptedSecret;
      existing.isActive = true;
      await existing.save();
      return { ...existing.toObject(), rawSecret };
    }

    const publicId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const created = await WebhookSubscription.create({
      publicId,
      tenantId,
      url,
      secret: encryptedSecret,
      events,
      isActive: true
    });

    return { ...created.toObject(), rawSecret };
  }
}

