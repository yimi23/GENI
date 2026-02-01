import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GeniLogoAnimationProps {
  onComplete?: () => void;
}

export function GeniLogoAnimation({ onComplete }: GeniLogoAnimationProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 3800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white overflow-hidden flex items-center justify-center"
      animate={{
        opacity: fadeOut ? 0 : 1,
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      {/* Subtle ambient particles in background */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0],
            y: [0, -120],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Central content */}
      <div className="relative z-10">
        {/* Subtle glow background */}
        <motion.div
          className="absolute inset-0 -m-32 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 rounded-full blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.5, 0.3], scale: 1 }}
          transition={{
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1.5, ease: "easeOut" },
          }}
        />

        {/* GENI Logo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.img
            src="/geni-logo.png"
            alt="GENI Healthcare Assistant"
            className="w-80 h-auto"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.8,
            ease: "easeOut",
          }}
          className="text-center mt-8"
        >
          <p
            className="text-lg tracking-wide text-slate-600"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Healthcare Assistant
          </p>
        </motion.div>

        {/* Single elegant pulse ring */}
        <motion.div
          className="absolute inset-0 -m-24 border border-blue-400/20 rounded-full pointer-events-none"
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: [1, 1.5],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1.2,
          }}
        />
      </div>

      {/* Minimal status indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="text-xs text-slate-500 tracking-wide">READY</span>
      </motion.div>
    </motion.div>
  );
}
