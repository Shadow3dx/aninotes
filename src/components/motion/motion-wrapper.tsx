"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeIn, getReducedMotionVariants } from "@/lib/motion";

interface MotionWrapperProps {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
}

export function MotionWrapper({
  children,
  variants = fadeIn,
  className,
  delay,
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();
  const activeVariants = shouldReduceMotion
    ? getReducedMotionVariants(variants)
    : variants;

  return (
    <motion.div
      variants={activeVariants}
      initial="hidden"
      animate="visible"
      className={className}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}
