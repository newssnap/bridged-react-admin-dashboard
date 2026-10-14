import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const PIECE_TONES = [
  'bg-primary',
  'bg-success',
  'bg-warning',
  'bg-chart-2',
  'bg-chart-4',
  'bg-sky-500',
];

const CARD_SPRING = { type: 'spring', duration: 0.35, bounce: 0 };

function createPieces(count = 36) {
  return Array.from({ length: count }, (_, index) => {
    // Spread across the width (vw from the centre), drift a little, fall past the bottom edge.
    const x = Math.round((Math.random() - 0.5) * 100);
    const drift = Math.round((Math.random() - 0.5) * 16);
    return {
      id: index,
      tone: PIECE_TONES[index % PIECE_TONES.length],
      fromX: `${x}vw`,
      toX: `${x + drift}vw`,
      rotate: Math.round(Math.random() * 360),
      spin: Math.round(360 + Math.random() * 360),
      delay: Math.random() * 0.35,
      duration: 1.8 + Math.random() * 1.2,
      wide: index % 3 === 0,
    };
  });
}

/** A short confetti burst from the top edge; transforms and opacity only. */
function Confetti() {
  const [pieces] = useState(createPieces);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map(piece => (
        <motion.span
          key={piece.id}
          className={cn(
            'absolute top-0 start-1/2 h-1.5 rounded-xs',
            piece.wide ? 'w-3' : 'w-2',
            piece.tone
          )}
          initial={{ x: piece.fromX, y: '-10vh', rotate: piece.rotate, opacity: 1 }}
          animate={{
            x: piece.toX,
            y: '110vh',
            rotate: piece.rotate + piece.spin,
            opacity: 0,
          }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen hand-off shown after a Claude connection is authorised, while the browser is
 * sent back to Claude. Confetti plays once, and not at all with reduced motion.
 */
function ClaudeRedirectOverlay({ open }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="claude-redirect"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {!reduceMotion && <Confetti />}
          <motion.div
            className="relative flex w-full max-w-[420px] flex-col items-center gap-5 rounded-xl bg-card px-8 py-9 text-center shadow-float ring-1 ring-foreground/10"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : CARD_SPRING}
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-6" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Connected to Claude
              </h2>
              <p className="text-sm text-muted-foreground">Taking you back to Claude…</p>
            </div>
            <Spinner className="size-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ClaudeRedirectOverlay;
