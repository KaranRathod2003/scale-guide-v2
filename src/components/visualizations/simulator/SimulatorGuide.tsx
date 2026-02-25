'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideStep {
  selector: string;
  title: string;
  description: string;
}

const STEPS: GuideStep[] = [
  {
    selector: '[data-guide-step="config"]',
    title: 'Configure Your Setup',
    description: 'Adjust replicas, thresholds, and scaling parameters. These settings define how the autoscaler behaves during the simulation.',
  },
  {
    selector: '[data-guide-step="timeline"]',
    title: 'Start the Simulation',
    description: 'Press Play to begin. Use speed controls to slow down or fast-forward. Reset anytime to start fresh.',
  },
  {
    selector: '[data-guide-step="events"]',
    title: 'Trigger Events',
    description: 'Inject traffic spikes, pod crashes, or cooldowns while the simulation runs. Watch how the autoscaler reacts in real-time.',
  },
  {
    selector: '[data-guide-step="metrics"]',
    title: 'Watch the Results',
    description: 'Live metrics show pod count, CPU usage, traffic, and latency. These update every simulation tick.',
  },
  {
    selector: '[data-guide-step="hints"]',
    title: 'Learn from Hints',
    description: 'Smart hints analyze your config and suggest improvements. Look for tips, warnings, and best-practice recommendations.',
  },
];

const STORAGE_KEY = 'simulator-guide-seen';

interface SimulatorGuideProps {
  active: boolean;
}

export default function SimulatorGuide({ active }: SimulatorGuideProps) {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>(0);

  const startGuide = useCallback(() => {
    setCurrentStep(0);
  }, []);

  // Expose replay function globally
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__replaySimulatorGuide = () => {
      startGuide();
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__replaySimulatorGuide;
    };
  }, [startGuide]);

  // Show guide on first visit to simulator mode
  useEffect(() => {
    if (!active) {
      setCurrentStep(null);
      return;
    }
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so elements are rendered
      const timer = setTimeout(() => {
        startGuide();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [active, startGuide]);

  // Track the highlighted element's position
  useEffect(() => {
    if (currentStep === null) return;

    const step = STEPS[currentStep];
    const updateRect = () => {
      const el = document.querySelector(step.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      rafRef.current = requestAnimationFrame(updateRect);
    };

    // Initial delay for scroll to settle
    const timer = setTimeout(() => {
      updateRect();
    }, 100);

    const handleResize = () => {
      const el = document.querySelector(step.selector);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStep]);

  const next = useCallback(() => {
    if (currentStep === null) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Done
      localStorage.setItem(STORAGE_KEY, 'true');
      setCurrentStep(null);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setCurrentStep(null);
  }, []);

  if (currentStep === null || !rect) return null;

  const step = STEPS[currentStep];
  const padding = 8;
  const cutout = {
    x: rect.x - padding,
    y: rect.y - padding,
    w: rect.width + padding * 2,
    h: rect.height + padding * 2,
    rx: 12,
  };

  // Position tooltip below or above the cutout
  const viewportH = window.innerHeight;
  const spaceBelow = viewportH - (cutout.y + cutout.h);
  const tooltipBelow = spaceBelow > 200;
  const tooltipTop = tooltipBelow ? cutout.y + cutout.h + 16 : cutout.y - 16;
  const tooltipLeft = Math.max(16, Math.min(cutout.x, window.innerWidth - 360));

  return (
    <AnimatePresence>
      <motion.div
        key="guide-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* SVG mask overlay */}
        <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <mask id="guide-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.w}
                height={cutout.h}
                rx={cutout.rx}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#guide-mask)"
          />
        </svg>

        {/* Highlight border ring */}
        <motion.div
          layoutId="guide-highlight"
          className="absolute rounded-xl border-2 border-brand-400/60 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
          style={{
            left: cutout.x,
            top: cutout.y,
            width: cutout.w,
            height: cutout.h,
            pointerEvents: 'none',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: tooltipBelow ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: tooltipBelow ? 10 : -10 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="absolute z-[10000] w-[320px] rounded-xl border border-zinc-600/60 bg-[#1e2028] p-4 shadow-2xl shadow-black/50"
          style={{
            left: tooltipLeft,
            top: tooltipBelow ? tooltipTop : undefined,
            bottom: tooltipBelow ? undefined : viewportH - tooltipTop,
            pointerEvents: 'auto',
          }}
        >
          {/* Step counter */}
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
              {currentStep + 1} / {STEPS.length}
            </span>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-4 rounded-full transition-colors ${
                    i <= currentStep ? 'bg-brand-400' : 'bg-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <h4 className="text-sm font-semibold text-white">{step.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300">{step.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={skip}
              className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
            >
              {currentStep < STEPS.length - 1 ? 'Next' : 'Done'}
            </button>
          </div>
        </motion.div>

        {/* Click blocker (clicking overlay skips to next or closes) */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: 'auto', zIndex: -1 }}
          onClick={next}
        />
      </motion.div>
    </AnimatePresence>
  );
}
