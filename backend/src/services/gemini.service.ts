import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

const getSystemPrompt = (stage: string, language: string) => {
  const baseSchema = `{
    "score": "number (0-100)",
    "findings": [{"severity": "critical|high|medium|low", "line": "number|null", "title": "string", "description": "string"}],
    "suggestions": [{"title": "string", "before": "string", "after": "string"}],
    "summary": "string"
  }`;

  if (stage === 'DEV') {
    return `You are a senior software engineer conducting a code review.
Analyze the following ${language} code for:
- Logic errors and bugs
- Code readability and naming conventions
- Code duplication and DRY violations
- Complexity and cyclomatic complexity issues
- Missing error handling
- Type safety issues
Respond ONLY in valid JSON with this schema:
${baseSchema}`;
  } else if (stage === 'SECURITY') {
    return `You are an application security engineer (OWASP Top 10 expert).
Analyze the following ${language} code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Insecure authentication/authorization patterns
- Sensitive data exposure (hardcoded secrets, API keys)
- Insecure dependencies or imports
- CSRF, SSRF, and access control issues
- Input validation weaknesses
Respond ONLY in valid JSON matching the exact schema:
${baseSchema}
Severity 'critical' = exploitable vulnerability.`;
  } else if (stage === 'DEPLOY') {
    return `You are a DevOps and CI/CD expert.
Analyze the following ${language} code for:
- Environment variable usage (no hardcoded configs)
- Logging and observability (structured logs, no console.log)
- Graceful shutdown handling
- Health check compatibility
- Docker and containerization readiness
- CI/CD pipeline compatibility (tests, linting hooks)
- Secret management best practices
Respond ONLY in valid JSON matching the exact schema:
${baseSchema}`;
  } else if (stage === 'PRODUCTION') {
    return `You are a staff-level engineer reviewing for production scale.
Analyze the following ${language} code for:
- Scalability and horizontal scaling readiness
- Database query efficiency (N+1 queries, missing indexes)
- Caching strategies and cache invalidation
- Rate limiting and throttling
- Memory leaks and resource management
- Performance bottlenecks and time complexity
- Resilience patterns (retries, circuit breakers, timeouts)
Respond ONLY in valid JSON matching the exact schema:
${baseSchema}`;
  }
  return '';
};

export const runReviewStage = async (stage: string, code: string, language: string) => {
  const systemInstruction = getSystemPrompt(stage, language);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: code,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error in Gemini API for stage ${stage}:`, error);
    
    // Fallback if formatting fails or quota error
    return {
      score: 50,
      findings: [{ severity: 'low', line: null, title: 'Analysis Error', description: 'Could not perform full AI review for this stage due to an API error.' }],
      suggestions: [],
      summary: 'AI analysis failed for this stage.'
    };
  }
};
