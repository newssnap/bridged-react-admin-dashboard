import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';

/*
 * Mounts and unmounts `children` by growing / collapsing its height, so the content around
 * it slides instead of jumping.
 *
 * <HeightReveal show={hasSelection}>
 *   <SelectionBar />
 * </HeightReveal>
 *
 * `initial={false}` skips the animation when it is already shown on first paint. Extra props
 * go to the animated wrapper, which clips its content only while it moves.
 */

const HEIGHT_REVEAL = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  // Unclip once open so focus rings and shadows inside aren't cut off.
  shown: { height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } },
};

const HEIGHT_REVEAL_TRANSITION = {
  // Strong ease-out, same curve as accordions (--ease-height).
  height: { duration: 0.27, ease: [0.25, 1, 0.5, 1] },
  opacity: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
};

function HeightReveal({ show, initial = true, children, className, style, ...props }) {
  return (
    <AnimatePresence initial={initial}>
      {show && (
        <motion.div
          key="height-reveal"
          data-slot="height-reveal"
          variants={HEIGHT_REVEAL}
          initial="hidden"
          animate="shown"
          exit="hidden"
          transition={HEIGHT_REVEAL_TRANSITION}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { HeightReveal };
