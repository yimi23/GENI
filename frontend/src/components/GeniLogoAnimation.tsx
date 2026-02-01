import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GeniLogoAnimationProps {
  onComplete?: () => void;
}

export function GeniLogoAnimation({ onComplete }: GeniLogoAnimationProps) {
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Start fade out after animation completes (3.5s total animation time)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3500);

    // Call onComplete after fade out finishes (add 800ms for fade duration)
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 4300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const letters = [
    { char: "G", particles: 12 },
    { char: "E", particles: 10 },
    { char: "N", particles: 10 },
    { char: "I", particles: 8 },
  ];

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
      {showContent &&
        [...Array(20)].map((_, i) => (
          <motion.div
            key={`ambient-${i}`}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0],
              y: [0, -100],
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
          className="absolute inset-0 -m-32 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-blue-500/10 rounded-full blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.5, 0.3], scale: 1 }}
          transition={{
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1.2, ease: "easeOut" },
          }}
        />

        {/* GENI Letters */}
        <div className="relative flex items-center justify-center gap-2">
          {letters.map((letter, letterIndex) => (
            <div key={letter.char} className="relative inline-block">
              {/* Particles converging */}
              {showContent &&
                [...Array(letter.particles)].map((_, particleIndex) => {
                  const totalParticles = letter.particles;
                  const angle = (particleIndex / totalParticles) * Math.PI * 2;
                  const distance = 150;
                  const startX = Math.cos(angle) * distance;
                  const startY = Math.sin(angle) * distance;

                  return (
                    <motion.div
                      key={`particle-${letterIndex}-${particleIndex}`}
                      className="absolute w-1.5 h-1.5 bg-blue-500/60 rounded-full"
                      style={{
                        left: "50%",
                        top: "50%",
                      }}
                      initial={{
                        x: startX,
                        y: startY,
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        delay: letterIndex * 0.15 + particleIndex * 0.02,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}

              {/* Letter */}
              <motion.div
                className="text-8xl font-bold relative z-10"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  color: "#2563eb",
                }}
                initial={{ opacity: 0, scale: 0.3, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: letterIndex * 0.15 + 0.8,
                  type: "spring",
                  stiffness: 150,
                  damping: 12,
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: letterIndex * 0.2 + 2,
                    ease: "easeInOut",
                  }}
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #14b8a6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    display: "inline-block",
                  }}
                >
                  {letter.char}
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 2,
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

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 -m-24 border border-blue-400/20 rounded-full pointer-events-none"
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: [1, 1.8],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: 2.5,
          }}
        />
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <motion.div
          className="w-2 h-2 bg-teal-500 rounded-full"
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