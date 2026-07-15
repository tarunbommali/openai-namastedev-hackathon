import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    candidateId: String,
    name: String,
    email: String,
    status: String,
    parsedResume: Object,
    matchScore: Number,
    explanation: String,
    gaps: [String]
  },
  { timestamps: true }
);

const interviewSchema = new mongoose.Schema(
  {
    candidateId: String,
    candidate: String,
    interviewer: String,
    round: String,
    time: String,
    status: String
  },
  { timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    interviewId: String,
    candidate: String,
    interviewer: String,
    feedbackText: String,
    recommendation: Object
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);
export const Interview = mongoose.model("Interview", interviewSchema);
export const Feedback = mongoose.model("Feedback", feedbackSchema);
