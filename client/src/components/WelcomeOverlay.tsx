import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Guest } from "@shared/schema";
import { Volume2, VolumeX } from "lucide-react";

interface WelcomeOverlayProps {
  guest: Guest;
  onComplete: () => void;
}

export function WelcomeOverlay({ guest, onComplete }: WelcomeOverlayProps) {
  const [stage, setStage] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Auto-advance through stages
    const timers = [
      setTimeout(() => setStage(1), 500),   // Show "Hello"
      setTimeout(() => setStage(2), 2000),  // Show guest name
      setTimeout(() => setStage(3), 4000),  // Show "We proudly present"
      setTimeout(() => setStage(4), 6000),  // Show "to:"
      setTimeout(() => onComplete(), 8000), // Complete and show main content
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(console.error);
        audioRef.current.muted = false;
      } else {
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Background particles/stars effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Audio element - using a placeholder path, user will provide the actual file */}
      <audio ref={audioRef} loop>
        <source src="/music/young-and-beautiful.mp3" type="audio/mpeg" />
      </audio>

      {/* Music toggle button */}
      <motion.button
        onClick={toggleMute}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
      </motion.button>

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.p
              key="hello"
              className="text-white/80 text-xl md:text-2xl tracking-[0.3em] uppercase font-light mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Hello
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 2 && (
            <motion.h1
              key="name"
              className="text-4xl md:text-6xl lg:text-7xl font-script text-[#e6b980] mb-8"
              style={{ textShadow: "0 0 40px rgba(230, 185, 128, 0.5)" }}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {guest.name}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 3 && (
            <motion.div
              key="present"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#e6b980] to-transparent mx-auto mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <p className="text-white/90 text-lg md:text-xl tracking-wide font-light">
                We proudly present you to
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 4 && (
            <motion.div
              key="wedding"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-8"
            >
              <p className="text-white/60 text-sm tracking-[0.4em] uppercase mb-4">
                The Wedding of
              </p>
              <h2
                className="text-5xl md:text-7xl lg:text-8xl font-script text-white"
                style={{ textShadow: "0 0 60px rgba(255, 255, 255, 0.3)" }}
              >
                Rizky & Davina
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click to continue hint */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm tracking-widest"
            >
              scroll to continue
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </motion.div>
  );
}
