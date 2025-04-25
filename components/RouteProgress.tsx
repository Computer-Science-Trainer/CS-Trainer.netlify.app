"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

import { ProgressBar } from "./ProgressBar";

export const RouteProgress: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const MIN_DISPLAY_MS = 300;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");

      if (
        target &&
        (target as HTMLAnchorElement).href.startsWith(window.location.origin)
      ) {
        setVisible(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), MIN_DISPLAY_MS);
      }
    };

    document.addEventListener("mousedown", onClick);

    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), MIN_DISPLAY_MS);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return visible ? <ProgressBar /> : null;
};
