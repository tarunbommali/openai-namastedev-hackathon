class HireFlowError(Exception):
    """Base application error."""


class AgentExecutionError(HireFlowError):
    """Raised when a CrewAI agent fails after retries."""
