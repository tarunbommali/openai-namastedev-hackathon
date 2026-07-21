import mongoose, { Document, Schema } from "mongoose";
import { WEBHOOK_EVENTS, WebhookEvent } from "../schemas/webhookSubscription.schema";

export { WEBHOOK_EVENTS };
export type { WebhookEvent };

export interface IWebhookSubscription extends Document {
  publicId: string;
  tenantId: string;
  url: string;
  secret: string;
  events: Array<WebhookEvent>;
  isActive: boolean;
}

const webhookSubscriptionSchema = new Schema<IWebhookSubscription>(
  {
    publicId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, default: "default-tenant", index: true },
    url: { type: String, required: true },
    secret: { type: String, required: true },
    events: { type: [String], required: true, default: ["candidate.screened", "decision.made"] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const WebhookSubscription = mongoose.model<IWebhookSubscription>(
  "WebhookSubscription",
  webhookSubscriptionSchema
);
