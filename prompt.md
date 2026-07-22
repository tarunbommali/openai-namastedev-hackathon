You are a Principal Software Architect, Staff Backend Engineer, AI Systems Architect, DevOps Architect, and Technical Documentation Reviewer.

Your task is to perform a comprehensive architecture review of my project documentation.

This is NOT a hackathon project.

This is an Extended MVP intended to become a production SaaS application.

Your objective is to review every part of the architecture exactly like a senior architect reviewing a production design document before implementation.

-----------------------------------
GOALS
-----------------------------------

1. Verify the architecture.

2. Verify every SDLC phase.

3. Verify every component.

4. Verify every API.

5. Verify every folder responsibility.

6. Verify every module interaction.

7. Verify every data flow.

8. Verify every security layer.

9. Verify every AI workflow.

10. Verify deployment readiness.

11. Verify maintainability.

12. Verify scalability.

13. Verify extensibility.

14. Verify developer experience.

15. Verify production readiness.

-----------------------------------
REVIEW RULES
-----------------------------------

Do NOT rewrite everything.

Instead review it section by section.

For each section produce:

✓ What is good

⚠ Missing items

❌ Problems

💡 Suggested improvements

⭐ Production-grade recommendation

If something is already good,
say

"No changes required."

Do NOT invent technologies.

Only recommend technologies that naturally fit the existing architecture.

-----------------------------------
REVIEW CATEGORIES
-----------------------------------

Review the following:

1. Executive Summary

2. Business Requirements

3. Functional Requirements

4. Non Functional Requirements

5. Architecture Principles

6. Architectural Decisions (ADR)

7. High Level Design (HLD)

8. Low Level Design (LLD)

9. Request Lifecycle

10. Domain Model

11. Database Design

12. Folder Structure

13. Module Responsibilities

14. API Contracts

15. Authentication

16. Authorization

17. RBAC

18. Tenant Isolation

19. Validation

20. Error Handling

21. Logging

22. Audit Logging

23. AI Architecture

24. CrewAI Pipeline

25. Agent Responsibilities

26. AI Service Communication

27. Data Flow

28. Sequence Diagrams

29. State Machines

30. Configuration

31. Deployment

32. Docker

33. Monitoring

34. Observability

35. Reliability

36. Health Checks

37. Testing Strategy

38. Verification Strategy

39. Production Readiness

40. Extension Points

-----------------------------------
FOR EACH SECTION VERIFY
-----------------------------------

Check

• Is it complete?

• Is anything unnecessary?

• Is anything duplicated?

• Is anything missing?

• Is it logically ordered?

• Is it scalable?

• Is it maintainable?

• Is it production ready?

• Can another developer understand it?

• Does it follow software engineering best practices?

• Does it violate SOLID?

• Does it violate Separation of Concerns?

• Does it follow API-first architecture?

• Does it support future extensions?

-----------------------------------
VERIFY FLOWS
-----------------------------------

Verify these flows completely.

Authentication

Candidate Registration

Company Registration

Job Creation

Resume Upload

Resume Screening

Interview Scheduling

Interview Feedback

Hiring Decision

Offer Generation

Audit Logging

Tenant Isolation

Role Authorization

AI Communication

Error Flow

Request Lifecycle

Deployment Flow

For each flow identify

• Missing validations

• Missing edge cases

• Missing security

• Missing failure handling

-----------------------------------
VERIFY ARCHITECTURE
-----------------------------------

Review whether

React

↓

Express

↓

MongoDB

↓

FastAPI

↓

CrewAI

is the correct architecture.

If not

Explain WHY

Recommend a better approach.

-----------------------------------
VERIFY DOCUMENTATION QUALITY
-----------------------------------

Review

Section ordering

Readability

Professionalism

Consistency

Terminology

Naming conventions

Diagram quality

Tables

Formatting

Completeness

-----------------------------------
VERIFY PRODUCTION READINESS
-----------------------------------

Score each category

Architecture

Security

Maintainability

Scalability

Extensibility

Developer Experience

Deployment

Testing

Documentation

AI Design

Overall

Provide a score out of 10.

-----------------------------------
OUTPUT FORMAT
-----------------------------------

Return the review in this format.

## Section Name

Current Score

Strengths

Weaknesses

Missing Items

Recommendations

Priority

High / Medium / Low

Estimated Effort

Small / Medium / Large

-----------------------------------
FINAL OUTPUT
-----------------------------------

At the end provide

1. Overall Architecture Score

2. Production Readiness Score

3. Documentation Score

4. Top 20 Improvements (highest impact first)

5. Things that should NOT be changed

6. Final Verdict

Do not suggest technologies simply because they are popular.

Recommend only improvements that genuinely strengthen this architecture while keeping the system clean, modular, maintainable, and aligned with an Extended MVP intended for production.