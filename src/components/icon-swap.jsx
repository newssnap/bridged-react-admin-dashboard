import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';

/*
 * Crossfades between icons when `swapKey` changes: the old one blurs and shrinks out while
 * the new one scales in, in place. Under reduced motion it only fades (App's MotionConfig).
 *
 * <IconSwap swapKey={copied ? 'done' : 'copy'}>
 *   <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} />
 * </IconSwap>
 *
 * Skips the animation on first paint. Extra props go to the wrapper span.
 */

const ICON_SWAP = {
  initial: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
};

const ICON_SWAP_TRANSITION = { type: 'spring', duration: 0.3, bounce: 0 };

function IconSwap({ swapKey, children, className, ...props }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={swapKey}
        data-slot="icon-swap"
        variants={ICON_SWAP}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={ICON_SWAP_TRANSITION}
        className={className ?? 'inline-flex shrink-0 items-center justify-center'}
        {...props}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

export { IconSwap };
