export const job = {
  id: "job-backend-node-distributed",
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
};

export const candidates = [
  {
    id: "cand-john",
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
      roleSignals: ["distributed systems", "backend engineering", "production Docker deployments", "event-driven architecture"],
      relevantProjects: ["Kafka order pipeline", "Redis-backed API gateway", "AWS service migration"]
    },
    matchScore: 92,
    confidence: 95,
    explanation:
      "Strong backend engineering experience, distributed systems background, production Docker deployments, and direct Kafka experience. Limited Kubernetes exposure is the main gap.",
    strengths: ["Distributed systems experience", "Docker expertise", "Node.js backend development", "Kafka event pipelines"],
    gaps: ["Kubernetes"]
  },
  {
    id: "cand-aisha",
    name: "Aisha Mehta",
    email: "aisha.mehta@example.com",
    status: "Ranked",
    parsedResume: {
      name: "Aisha Mehta",
      skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
      experienceYears: 5,
      roleSignals: ["backend engineering", "cloud services", "data APIs"],
      relevantProjects: ["analytics API migration", "cloud deployment platform"]
    },
    matchScore: 84,
    confidence: 87,
    explanation:
      "Excellent backend and deployment background with strong API fundamentals. Slightly less direct Node.js and Kafka experience than John.",
    strengths: ["Backend API design", "Docker deployment", "AWS services"],
    gaps: ["Node.js production depth", "Kafka"]
  },
  {
    id: "cand-priya",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    status: "Ranked",
    parsedResume: {
      name: "Priya Nair",
      skills: ["React", "Node.js", "GraphQL", "MongoDB"],
      experienceYears: 3,
      roleSignals: ["full-stack development", "frontend-heavy product work"],
      relevantProjects: ["candidate portal", "GraphQL profile service"]
    },
    matchScore: 78,
    confidence: 81,
    explanation:
      "Good Node.js overlap, but experience is more full-stack than senior distributed backend systems.",
    strengths: ["Node.js familiarity", "product engineering", "API integration"],
    gaps: ["distributed systems", "Docker", "Kafka", "AWS depth"]
  }
];

export const interviewers = [
  {
    id: "int-rahul",
    name: "Rahul Sharma",
    role: "Senior Staff Engineer",
    focus: "Technical Round 1 and distributed systems"
  }
];

export const interviews = [
  {
    id: "iv-001",
    candidateId: "cand-john",
    candidate: "John Doe",
    interviewer: "Rahul Sharma",
    round: "Technical Round 1",
    time: "Tomorrow, 2:00 PM",
    status: "Created"
  }
];

export const feedback = [];
