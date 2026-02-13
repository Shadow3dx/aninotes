import type { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" as const },
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1, ease: "easeOut" as const },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const imageZoom = {
  scale: 1.05,
  transition: { duration: 0.3, ease: "easeOut" },
};

// Returns instant transitions when reduced motion is preferred
export function getReducedMotionVariants(variants: Variants): Variants {
  const reduced: Variants = {};
  for (const key in variants) {
    const variant = variants[key];
    if (typeof variant === "object" && variant !== null) {
      reduced[key] = {
        ...variant,
        transition: { duration: 0 },
      };
    } else {
      reduced[key] = variant;
    }
  }
  return reduced;
}
