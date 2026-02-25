import yaml from 'js-yaml';

export interface YamlParseError {
  message: string;
  line?: number;
}

export interface YamlParseResult {
  success: boolean;
  documents: Record<string, unknown>[];
  errors: YamlParseError[];
}

export function parseYaml(input: string): YamlParseResult {
  const errors: YamlParseError[] = [];
  const documents: Record<string, unknown>[] = [];

  if (!input.trim()) {
    return { success: false, documents: [], errors: [{ message: 'Empty input' }] };
  }

  const parts = input.split(/^---$/m).filter((p) => p.trim());

  for (const part of parts) {
    try {
      const doc = yaml.load(part) as Record<string, unknown>;
      if (doc && typeof doc === 'object') {
        documents.push(doc);
      }
    } catch (err) {
      const yamlErr = err as yaml.YAMLException;
      errors.push({
        message: yamlErr.message || 'Invalid YAML syntax',
        line: yamlErr.mark?.line ? yamlErr.mark.line + 1 : undefined,
      });
    }
  }

  return {
    success: errors.length === 0 && documents.length > 0,
    documents,
    errors,
  };
}
