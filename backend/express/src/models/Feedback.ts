import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  publicId: string;
  interviewId?: string;
  candidate: string;
  interviewer: string;
  feedbackText: string;
  ratings?: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
  };
  recommendation: {
    recommendation: string;
    reason: string;
    confidence: number;
  };
  aiSummary?: string;
  submittedBy?: mongoose.Types.ObjectId;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    publicId: { type: String, required: true, unique: true },
    interviewId: { type: String },
    candidate: { type: String, required: true },
    interviewer: { type: String, required: true },
    feedbackText: { type: String, required: true },
    ratings: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      cultureFit: { type: Number, default: 0 }
    },
    recommendation: {
      recommendation: String,
      reason: String,
      confidence: Number
    },
    aiSummary: { type: String, default: "" },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
