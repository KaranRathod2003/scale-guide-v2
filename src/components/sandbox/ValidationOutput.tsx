'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SqlValidationResult, K8sValidationResult, DeploymentValidationResult } from '@/types/sandbox';

type ValidationResult =
  | { type: 'sql'; result: SqlValidationResult }
  | { type: 'k8s'; result: K8sValidationResult }
  | { type: 'deployment'; result: DeploymentValidationResult };

export default function ValidationOutput({ validation }: { validation: ValidationResult | null }) {
  if (!validation) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={JSON.stringify(validation)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {validation.type === 'sql' && <SqlOutput result={validation.result} />}
        {validation.type === 'k8s' && <K8sOutput result={validation.result} />}
        {validation.type === 'deployment' && <DeploymentOutput result={validation.result} />}
      </motion.div>
    </AnimatePresence>
  );
}

function SqlOutput({ result }: { result: SqlValidationResult }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        result.isCorrect
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-red-500/30 bg-red-500/10 text-red-300'
      }`}
    >
      {result.feedback}
    </div>
  );
}

function K8sOutput({ result }: { result: K8sValidationResult }) {
  const hasIssues = result.errors.length > 0 || result.warnings.length > 0;

  return (
    <div className="space-y-2">
      {result.isValid && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Valid manifest! {result.resources.length} resource(s) detected.
          {result.matchesExpected && ' Matches expected output.'}
        </div>
      )}

      {result.errors.map((err, i) => (
        <div
          key={`err-${i}`}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300"
        >
          <span className="font-medium">{err.field}:</span> {err.message}
          {err.line && <span className="ml-1 text-xs text-red-400">(line {err.line})</span>}
        </div>
      ))}

      {result.warnings.map((warn, i) => (
        <div
          key={`warn-${i}`}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300"
        >
          <span className="font-medium">{warn.field}:</span> {warn.message}
        </div>
      ))}

      {!hasIssues && !result.isValid && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Invalid manifest. Please check the YAML syntax.
        </div>
      )}
    </div>
  );
}

function DeploymentOutput({ result }: { result: DeploymentValidationResult }) {
  return (
    <div className="space-y-2">
      {result.detectedStrategy && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
          Detected strategy: <span className="font-semibold">{result.detectedStrategy}</span>
          {result.matchesExpected && ' — matches expected!'}
        </div>
      )}

      {result.isValid && result.errors.length === 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Valid deployment configuration!
        </div>
      )}

      {result.errors.map((err, i) => (
        <div
          key={`err-${i}`}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300"
        >
          <span className="font-medium">{err.field}:</span> {err.message}
        </div>
      ))}

      {result.warnings.map((warn, i) => (
        <div
          key={`warn-${i}`}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300"
        >
          <span className="font-medium">{warn.field}:</span> {warn.message}
        </div>
      ))}
    </div>
  );
}
