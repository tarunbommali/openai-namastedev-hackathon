import { connectDatabase, disconnectDatabase } from "../config/database";
import { Candidate } from "../models/Candidate";
import { Interview } from "../models/Interview";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { hashPassword } from "./password";

export async function seedDatabase() {
  const jobCount = await Job.countDocuments();
  if (jobCount === 0) {
    await Job.create({
      publicId: "job-backend-node-distributed",
      title: "Senior Backend Engineer",
      location: "Bengaluru / Remote",
      team: "Platform Engineering",
      summary:
        "Build reliable Node.js services, queue-backed workflows, and distributed systems for high-volume recruiting automation.",
      requirements: [
        "Node.js and Express APIs",
        "Distributed systems fundamentals",
        "Docker and cloud deployment",
        "Kafka or event-driven architecture",
        "AWS production services"
      ]
    });
  }

  const candCount = await Candidate.countDocuments();
  if (candCount === 0) {
    await Candidate.insertMany([
      {
        publicId: "cand-john",
        name: "John Doe",
        email: "john.doe@example.com",
        status: "Parsed and ranked",
        resumeText:
          "John Doe is a senior backend engineer with 6 years of experience building Node.js APIs, Express services, Dockerized deployments, Kafka pipelines, Redis caching, AWS infrastructure, and PostgreSQL data models for distributed systems.",
        parsedResume: {
          name: "John Doe",
          skills: ["Node.js", "Express", "Docker", "Kafka", "Redis", "AWS", "PostgreSQL"],
          experienceYears: 6,
          seniority: "Senior",
          domain: "Backend Engineering",
          education: "B.Tech Computer Science",
          achievements: ["Reduced API latency by 38%", "Scaled event pipeline to 2M messages/day"],
          roleSignals: ["distributed systems", "backend engineering", "production Docker deployments"],
          relevantProjects: ["Kafka order pipeline", "Redis-backed API gateway", "AWS service migration"]
        },
        matchScore: 92,
        confidence: 95,
        explanation: "Strong backend engineering experience with Kafka and Docker.",
        strengths: ["Distributed systems experience", "Docker expertise", "Node.js backend development", "Kafka event pipelines"],
        gaps: ["Kubernetes"]
      },
      {
        publicId: "cand-aisha",
        name: "Aisha Mehta",
        email: "aisha.mehta@example.com",
        status: "Ranked",
        resumeText: "Aisha Mehta backend engineer Python FastAPI PostgreSQL Docker AWS 5 years.",
        parsedResume: {
          name: "Aisha Mehta",
          skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
          experienceYears: 5,
          seniority: "Mid-Senior",
          domain: "Backend Engineering",
          education: "M.S. Computer Science",
          achievements: ["Migrated analytics APIs with zero downtime"],
          roleSignals: ["backend engineering", "cloud services"],
          relevantProjects: ["analytics API migration"]
        },
        matchScore: 84,
        confidence: 87,
        explanation: "Strong API and cloud background; less Node.js/Kafka depth.",
        strengths: ["Backend API design", "Docker deployment", "AWS services"],
        gaps: ["Node.js production depth", "Kafka"]
      },
      {
        publicId: "cand-priya",
        name: "Priya Nair",
        email: "priya.nair@example.com",
        status: "Ranked",
        resumeText: "Priya Nair full-stack React Node.js GraphQL MongoDB 3 years.",
        parsedResume: {
          name: "Priya Nair",
          skills: ["React", "Node.js", "GraphQL", "MongoDB"],
          experienceYears: 3,
          seniority: "Mid",
          domain: "Full-Stack Engineering",
          education: "B.E. Information Technology",
          achievements: ["Shipped candidate portal"],
          roleSignals: ["full-stack development"],
          relevantProjects: ["candidate portal"]
        },
        matchScore: 78,
        confidence: 81,
        explanation: "Good Node.js overlap; more full-stack than distributed backend.",
        strengths: ["Node.js familiarity", "product engineering"],
        gaps: ["distributed systems", "Docker", "Kafka"]
      }
    ]);
  }

  const interviewCount = await Interview.countDocuments();
  if (interviewCount === 0) {
    await Interview.create({
      publicId: "iv-001",
      candidateId: "cand-john",
      candidate: "John Doe",
      interviewer: "Rahul Sharma",
      round: "Technical Round 1",
      time: "Tomorrow, 2:00 PM",
      status: "Created"
    });
  }

  const users = [
    { email: "admin@hireflow.ai", name: "Admin User", role: "admin" as const, password: "Admin123!" },
    { email: "recruiter@hireflow.ai", name: "Recruiter User", role: "recruiter" as const, password: "Recruiter123!" },
    { email: "interviewer@hireflow.ai", name: "Rahul Sharma", role: "interviewer" as const, password: "Interviewer123!" },
    { email: "candidate@hireflow.ai", name: "John Doe", role: "candidate" as const, password: "Candidate123!" }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create({
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: await hashPassword(u.password)
      });
    }
  }

  // Link seeded candidate/interviewer users to domain rows for RBAC E2E
  const candidateUser = await User.findOne({ email: "candidate@hireflow.ai" });
  if (candidateUser) {
    await Candidate.findOneAndUpdate(
      { publicId: "cand-john" },
      { $set: { userId: candidateUser._id, email: "candidate@hireflow.ai" } }
    );
  }
  const interviewerUser = await User.findOne({ email: "interviewer@hireflow.ai" });
  if (interviewerUser) {
    await Interview.updateMany(
      { interviewer: "Rahul Sharma" },
      { $set: { interviewerUserId: interviewerUser._id } }
    );
  }

  console.log("Seed complete");
}

if (require.main === module) {
  connectDatabase()
    .then(seedDatabase)
    .then(() => disconnectDatabase())
    .catch(async (err) => {
      console.error(err);
      await disconnectDatabase();
      process.exit(1);
    });
}
