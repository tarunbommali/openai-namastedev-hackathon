import mongoose, { Document, Schema } from "mongoose";

export interface IInterview extends Document {
  publicId: string;
  candidateId: string;
  candidate: string;
  interviewer: string;
  interviewerUserId?: mongoose.Types.ObjectId;
  jobId?: string;
  round: string;
  time: string;
  status: string;
  joinLink?: string;
  rescheduleRequested?: boolean;
  rescheduleNote?: string;
}

const interviewSchema = new Schema<IInterview>(
  {
    publicId: { type: String, required: true, unique: true },
    candidateId: { type: String, default: "" },
    candidate: { type: String, required: true },
    interviewer: { type: String, required: true },
    interviewerUserId: { type: Schema.Types.ObjectId, ref: "User" },
    jobId: { type: String, default: "" },
    round: { type: String, default: "Technical Round 1" },
    time: { type: String, required: true },
    status: { type: String, default: "Scheduled" },
    joinLink: { type: String, default: "" },
    rescheduleRequested: { type: Boolean, default: false },
    rescheduleNote: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Interview = mongoose.model<IInterview>("Interview", interviewSchema);
