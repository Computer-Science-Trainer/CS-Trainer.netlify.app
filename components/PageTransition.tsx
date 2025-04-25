"use client";

import { usePathname } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const controls = useAnimation();
  const pathname = usePathname();

  useEffect(() => {
    controls.set({ opacity: 0, y: 20 });
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.4 } });
  }, [pathname, controls]);

  return (
    <motion.div
      animate={controls}
      className="relative w-full h-full"
      exit={{ opacity: 0, y: 20, transition: { duration: 0.5 } }}
      initial={{ opacity: 0, y: 20 }}
    >
      {children}
    </motion.div>
  );
};
