import mongoose, { Document, Schema } from "mongoose";
import { OFFER_STATUSES, OfferStatus } from "../schemas/offer.schema";

export { OFFER_STATUSES };
export type { OfferStatus };

export interface IOffer extends Document {
  publicId: string;
  candidateId: string;
  candidate: string;
  jobId?: string;
  subject: string;
  body: string;
  status: OfferStatus;
}

const offerSchema = new Schema<IOffer>(
  {
    publicId: { type: String, required: true, unique: true },
    candidateId: { type: String, required: true, index: true },
    candidate: { type: String, required: true },
    jobId: { type: String, default: "" },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: OFFER_STATUSES,
      default: "Drafted"
    }
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>("Offer", offerSchema);
