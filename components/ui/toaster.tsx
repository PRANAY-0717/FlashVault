"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function toast(message: string, type: Toast["type"] = "success") {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((fn) => fn({ id, message, type }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Register listener
  if (typeof window !== "undefined") {
    toastListeners = [
      (t) => {
        setToasts((prev) => [...prev, t]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== t.id));
        }, 3500);
      },
    ];
  }

  const colorMap = {
    success: "border-emerald-DEFAULT/40 bg-emerald-DEFAULT/10 text-emerald-DEFAULT",
    error: "border-danger/40 bg-danger/10 text-danger",
    info: "border-indigo/40 bg-indigo/10 text-indigo-DEFAULT",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`glass px-5 py-3 rounded-xl border text-sm font-medium max-w-xs ${colorMap[t.type]}`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

