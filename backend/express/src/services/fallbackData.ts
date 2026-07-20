/** Contract-compatible fallbacks when AI is down and ALLOW_AI_FALLBACK=true */

export const agentModelPlan = {
  resumeAgent: "gpt-4o-mini",
  matchAgent: "gpt-4o",
  questionAgent: "gpt-4o",
  schedulerAgent: "gpt-4o-mini",
  decisionAgent: "gpt-4o",
  feedbackAgent: "gpt-4o",
  briefingAgent: "gpt-4o",
  offerAgent: "gpt-4o-mini",
  embeddingSearch: "text-embedding-3-large"
};

export function emptyTrace(agent: string) {
  const now = new Date();
  return {
    id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agent,
    model: "fallback",
    status: "fallback",
    mode: "demo",
    startedAt: now.toISOString(),
    completedAt: now.toISOString(),
    durationMs: 0,
    inputPreview: "",
    outputSummary: "AI service fallback"
  };
}
