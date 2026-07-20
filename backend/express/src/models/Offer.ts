import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  publicId: string;
  candidateId: string;
  candidate: string;
  jobId?: string;
  subject: string;
  body: string;
  status: "Drafted" | "Sent" | "Accepted" | "Rejected";
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
      enum: ["Drafted", "Sent", "Accepted", "Rejected"],
      default: "Drafted"
    }
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>("Offer", offerSchema);
