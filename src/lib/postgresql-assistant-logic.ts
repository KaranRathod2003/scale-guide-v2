import type { PostgresConversationState, ExperienceLevel, ProgrammingLanguage } from '@/types/postgresql';
import type { AssistantMessage, Recommendation } from '@/types/assistant';

const experienceKeywords: Record<ExperienceLevel, string[]> = {
  beginner: ['beginner', 'new', 'never', 'starting', 'first time', 'learning', 'student', 'junior', 'no experience'],
  intermediate: ['intermediate', 'some experience', 'used before', 'familiar', 'basic knowledge', 'worked with', 'a few years'],
  advanced: ['advanced', 'expert', 'senior', 'years of experience', 'production', 'scale', 'performance', 'tuning', 'dba'],
};

const languageKeywords: Record<ProgrammingLanguage, string[]> = {
  nodejs: ['node', 'nodejs', 'node.js', 'javascript', 'typescript', 'express', 'next', 'nest'],
  python: ['python', 'django', 'flask', 'fastapi', 'sqlalchemy', 'psycopg'],
  java: ['java', 'spring', 'spring boot', 'hibernate', 'jdbc', 'maven', 'gradle'],
  cpp: ['c++', 'cpp', 'c plus plus', 'libpq', 'libpqxx', 'embedded', 'systems'],
};

function extractBestMatch<T extends string>(text: string, keywords: Record<T, string[]>): T | undefined {
  const lower = text.toLowerCase();
  let bestMatch: T | undefined;
  let bestScore = 0;
  for (const [type, kws] of Object.entries(keywords) as [T, string[]][]) {
    const score = kws.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }
  return bestScore > 0 ? bestMatch : undefined;
}

export function processPostgresMessage(message: string, state: PostgresConversationState): PostgresConversationState {
  const newState = { ...state, answers: { ...state.answers } };

  switch (state.step) {
    case 1: {
      const level = extractBestMatch(message, experienceKeywords);
      newState.answers.experienceLevel = level || 'beginner';
      newState.step = 2;
      break;
    }
    case 2: {
      const lower = message.toLowerCase();
      newState.answers.goal = message.trim();
      const lang = extractBestMatch(message, languageKeywords);
      newState.answers.currentStack = lang;
      newState.answers.hasDatabase = lower.includes('yes') || lower.includes('already') || lower.includes('existing') || lower.includes('migrate');
      newState.step = 3;
      break;
    }
    case 3: {
      const lower = message.toLowerCase();
      const lang = newState.answers.currentStack || extractBestMatch(message, languageKeywords);
      newState.answers.currentStack = lang || 'nodejs';
      newState.answers.needsScaling = lower.includes('scale') || lower.includes('performance') || lower.includes('production') || lower.includes('high traffic') || lower.includes('million');
      newState.step = 4;
      break;
    }
    case 4:
      break;
  }

  return newState;
}

export function getPostgresStepMessage(state: PostgresConversationState): AssistantMessage {
  switch (state.step) {
    case 1:
      return {
        role: 'assistant',
        text: "Let's find the right PostgreSQL learning path for you. What's your experience level with databases?",
        suggestions: ['Complete beginner', 'Some SQL experience', 'Intermediate (used PG before)', 'Advanced / DBA'],
      };
    case 2:
      return {
        role: 'assistant',
        text: `Got it. What are you trying to build or learn? And do you already have a database, or starting fresh?`,
        suggestions: ['Building a new web app', 'Migrating from MySQL/MongoDB', 'Learning SQL from scratch', 'Optimizing existing PG database'],
      };
    case 3:
      return {
        role: 'assistant',
        text: 'What programming language will you connect with? And will this be for production or learning?',
        suggestions: ['Node.js / TypeScript', 'Python', 'Java / Spring', 'Just learning SQL for now'],
      };
    case 4: {
      const rec = generatePostgresRecommendation(state.answers);
      return {
        role: 'assistant',
        text: `Based on your answers, here's your recommended learning path:\n\n${rec.reasoning}`,
        recommendation: rec,
        suggestions: ['Start over'],
      };
    }
    default:
      return {
        role: 'assistant',
        text: "Let's find the right PostgreSQL learning path for you.",
        suggestions: [],
      };
  }
}

export function generatePostgresRecommendation(answers: PostgresConversationState['answers']): Recommendation {
  const { experienceLevel, currentStack, hasDatabase, needsScaling } = answers;

  if (experienceLevel === 'beginner') {
    return {
      primary: 'prerequisites-setup',
      secondary: 'practice-examples',
      confidence: 92,
      reasoning: 'Start with **Prerequisites & Setup** to install PostgreSQL and learn essential tools (psql, pgAdmin). Then work through **Practice Examples** to build SQL skills from basic SELECTs to JOINs. Once comfortable, explore **Backend Connections** for your chosen language.',
      warnings: ['Take time with the setup -- a solid foundation saves debugging later.'],
    };
  }

  if (hasDatabase || experienceLevel === 'advanced') {
    return {
      primary: 'backend-connections',
      secondary: 'official-docs-summary',
      confidence: 88,
      reasoning: needsScaling
        ? 'Focus on **Backend Connections** for optimal pooling and driver configuration. The **Official Docs Summary** covers critical config parameters (shared_buffers, work_mem) and replication setup for scaling. Try the **Pool Visualizer** in the playground to see how different pool sizes affect behavior.'
        : 'Start with **Backend Connections** to see how your stack connects to PostgreSQL. The **Official Docs Summary** has condensed configuration and backup best practices for production.',
      warnings: needsScaling
        ? ['Connection pooling configuration is the #1 performance lever -- start with (2 * CPU cores) connections.']
        : [],
    };
  }

  if (currentStack) {
    const stackNames: Record<string, string> = {
      nodejs: 'Node.js',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
    };
    return {
      primary: 'backend-connections',
      secondary: 'practice-examples',
      confidence: 85,
      reasoning: `Start with **Backend Connections** to see how ${stackNames[currentStack] || 'your stack'} connects to PostgreSQL -- from raw drivers to ORMs and connection pooling. Use the **Connection Simulator** playground to visualize the full connection lifecycle. Then sharpen your SQL with **Practice Examples**.`,
      warnings: ['Use connection pooling from day one, even in development -- it prevents bad habits.'],
    };
  }

  // Default path for intermediate
  return {
    primary: 'why-postgresql',
    secondary: 'backend-connections',
    confidence: 80,
    reasoning: 'Start with **Why PostgreSQL** to understand its capabilities and how it compares to alternatives. Then move to **Backend Connections** for hands-on integration with your language of choice. The **Practice Examples** will solidify your SQL skills.',
    warnings: [],
  };
}
