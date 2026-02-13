"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, getReducedMotionVariants } from "@/lib/motion";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerContainer({
  children,
  className,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? getReducedMotionVariants(staggerContainer)
    : staggerContainer;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}
