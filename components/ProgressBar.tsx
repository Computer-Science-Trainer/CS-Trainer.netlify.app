import { motion } from "framer-motion";
import React from "react";

export const ProgressBar: React.FC = () => (
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: "100%" }}
    transition={{ duration: 1.5, ease: "linear" }}
    className="fixed top-0 left-0 h-1 bg-blue-500 z-50"
  />
);
