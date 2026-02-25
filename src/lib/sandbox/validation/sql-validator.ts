import type { SqlValidationResult, SandboxExercise } from '@/types/sandbox';

function normalizeSQL(sql: string): string {
  return sql
    .toLowerCase()
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*;\s*$/, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+as\s+/g, ' as ')
    .trim();
}

function structurallyEquivalent(userSQL: string, solutionSQL: string): boolean {
  let userNorm = normalizeSQL(userSQL);
  let solNorm = normalizeSQL(solutionSQL);

  // Remove default ASC ordering
  userNorm = userNorm.replace(/\s+asc\b/g, '');
  solNorm = solNorm.replace(/\s+asc\b/g, '');

  // Normalize quotes
  userNorm = userNorm.replace(/"/g, "'");
  solNorm = solNorm.replace(/"/g, "'");

  return userNorm === solNorm;
}

function checkKeywordsPresent(userSQL: string, requiredKeywords: string[]): string[] {
  const lower = userSQL.toLowerCase();
  return requiredKeywords.filter((kw) => !lower.includes(kw.toLowerCase()));
}

export function validateSQL(
  userSQL: string,
  exercise: SandboxExercise
): SqlValidationResult {
  const results = (exercise.precomputedResults || []) as Record<string, string | number>[];

  if (!userSQL.trim()) {
    return { isCorrect: false, matchType: 'incorrect', feedback: 'Please enter a SQL query.', results };
  }

  const userNorm = normalizeSQL(userSQL);

  if (userNorm === normalizeSQL(exercise.solution)) {
    return { isCorrect: true, matchType: 'exact', feedback: 'Correct! Well done.', results };
  }

  for (const alt of exercise.alternativeSolutions || []) {
    if (userNorm === normalizeSQL(alt)) {
      return { isCorrect: true, matchType: 'alternative', feedback: 'Correct! Nice alternative approach.', results };
    }
  }

  if (structurallyEquivalent(userSQL, exercise.solution)) {
    return { isCorrect: true, matchType: 'alternative', feedback: 'Correct!', results };
  }

  const missing = checkKeywordsPresent(userSQL, exercise.requiredKeywords || []);
  const feedback = missing.length > 0
    ? `Not quite. Consider using: ${missing.join(', ')}. Check the hint for guidance.`
    : 'Not quite right. Your query structure differs from the expected solution. Try the hint.';

  return { isCorrect: false, matchType: 'incorrect', feedback, results };
}
