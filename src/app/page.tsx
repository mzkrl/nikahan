"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring, useMotionValue } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Calendar, Clock, MapPin, Volume2, VolumeX, Loader2, Camera, Music, Sparkles, Star, Quote } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Guest {
  id: number;
  name: string;
  slug: string;
  attendanceStatus: string;
  wishes?: string;
}

// Music playlist
const PLAYLIST = [
  "/music/Lana Del Rey - Young and Beautiful.webm",
  "/music/Shane Filan - Beautiful In White.webm",
  "/music/Wedding Nasheed.webm"
];

// ==================== HYDRATION FIX HELPER ====================
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

// ==================== CLIENT ONLY ANIMATED BACKGROUNDS ====================
function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: 0
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 20, -20, 0],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        >
          <Heart
            className="opacity-20"
            style={{
              color: "#c9a050",
              width: 10 + Math.random() * 20,
              height: 10 + Math.random() * 20,
            }}
            fill="#c9a050"
          />
        </motion.div>
      ))}
    </div>
  );
}

function SparkleEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-amber-200"
          initial={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: 0
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            boxShadow: "0 0 10px #fbbf24"
          }}
        />
      ))}
    </div>
  );
}

// ==================== 3D TILT CARD ====================
function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x);
  const mouseY = useSpring(y);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="perspective-1000"
    >
      {children}
    </motion.div>
  );
}

// ==================== ANIMATED SECTION ====================
function AnimatedSection({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className={`py-16 md:py-24 px-4 md:px-8 ${className}`}
      style={style}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </motion.section>
  );
}

// ==================== WELCOME OVERLAY ====================
function WelcomeOverlay({ guest, onComplete, onPlayMusic }: { guest: Guest; onComplete: () => void; onPlayMusic: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => setStage(4), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleOpen = () => {
    onPlayMusic(); // Trigger play on user interaction!
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Background stars - ClientOnly for hydration safety */}
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              initial={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 1 + Math.random() * 3,
                height: 1 + Math.random() * 3,
                opacity: 0.2
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </ClientOnly>

      {/* Glowing orbs */}
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px]" animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="hello"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              </motion.div>
              <p className="text-white/80 text-xl md:text-2xl tracking-[0.3em] uppercase font-light">Hello</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 2 && (
            <motion.h1
              key="name"
              className="text-4xl md:text-6xl lg:text-7xl font-script my-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200"
              style={{ filter: "drop-shadow(0 0 20px rgba(230, 185, 128, 0.4))" }}
              initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
            >
              {guest.name}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 3 && (
            <motion.div
              key="present"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-white/90 text-lg md:text-xl tracking-wide font-light border-y border-white/20 py-2 inline-block">
                We proudly present you to
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 4 && (
            <motion.div
              key="wedding"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-8"
            >
              <p className="text-white/60 text-sm tracking-[0.5em] uppercase mb-4">The Wedding of</p>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-script text-white mb-12 drop-shadow-2xl">
                Dimas & Davina
              </h2>

              <motion.button
                onClick={handleOpen}
                className="px-12 py-5 rounded-full text-white font-medium shadow-2xl transition-all relative overflow-hidden group border border-white/20 backdrop-blur-sm"
                style={{ background: "linear-gradient(135deg, rgba(230,185,128,0.8) 0%, rgba(201,160,80,0.8) 100%)" }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(230, 185, 128, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2 text-lg tracking-widest uppercase">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Open Invitation
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ==================== HOME CONTENT ====================
function HomeContent() {
  const searchParams = useSearchParams();
  const guestSlug = searchParams.get("guest");

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string>("pending");
  const [wishes, setWishes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  // Init random song
  useEffect(() => {
    setCurrentSongIndex(Math.floor(Math.random() * PLAYLIST.length));
  }, []);

  // Fetch guest
  useEffect(() => {
    if (guestSlug) {
      setIsLoading(true);
      fetch(`/api/guests/slug/${guestSlug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setGuest(data);
          if (data) {
            const hasSeenWelcome = sessionStorage.getItem(`welcome-${guestSlug}`);
            if (!hasSeenWelcome) {
              setShowWelcome(true);
            }
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [guestSlug]);

  // Handle Play Music - Triggered by interaction
  const handlePlayMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => {
        console.warn("Autoplay failed, must interact", e);
        setIsMuted(true);
      });
      setIsMuted(false);
    }
  };

  const handleSongEnd = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentSongIndex && PLAYLIST.length > 1);
    setCurrentSongIndex(nextIndex);
  };

  // Auto-play effect for song change
  useEffect(() => {
    if (audioRef.current && !isMuted && !showWelcome) {
      audioRef.current.play().catch(() => setIsMuted(true));
    }
  }, [currentSongIndex]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.5;
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showWelcome && guest && (
          <WelcomeOverlay
            guest={guest}
            onComplete={() => {
              sessionStorage.setItem(`welcome-${guestSlug}`, "true");
              setShowWelcome(false);
            }}
            onPlayMusic={handlePlayMusic}
          />
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={PLAYLIST[currentSongIndex]}
        onEnded={handleSongEnd}
        preload="auto"
      />

      {/* Background Ambience */}
      <ClientOnly>
        <FloatingHearts />
      </ClientOnly>

      {/* FAB Music */}
      {!showWelcome && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-2xl glass-effect"
          style={{ backgroundColor: "rgba(201, 160, 80, 0.9)", backdropFilter: "blur(4px)" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={!isMuted ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </motion.div>
          {!isMuted && (
            <span className="absolute -inset-1 rounded-full animate-ping bg-amber-500/30" />
          )}
        </motion.button>
      )}

      <div className="overflow-x-hidden bg-[#fdfbf7] text-[#4a4a4a]">

        {/* HERO SECTION */}
        <motion.section
          ref={heroRef}
          className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <motion.img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
              style={{ scale: heroScale }}
            />
          </div>

          <ClientOnly> <SparkleEffect /> </ClientOnly>

          <div className="relative z-20 text-white max-w-4xl mx-auto space-y-8">
            <motion.p
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-lg md:text-xl font-medium tracking-[0.4em] uppercase"
            >
              The Wedding of
            </motion.p>

            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", duration: 1.5 }}
              className="font-script text-6xl md:text-8xl lg:text-9xl drop-shadow-lg text-amber-200"
            >
              Dimas & Davina
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-xl md:text-2xl font-serif italic"
            >
              Monday, 02 February 2026
            </motion.p>
          </div>

          <motion.div
            className="absolute bottom-10"
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </motion.div>
        </motion.section>

        {/* BRIDE & GROOM SECTION */}
        <div className="relative py-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

          {/* Groom */}
          <div className="max-w-6xl mx-auto px-4 mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, type: "spring" }}
                className="text-center md:text-right order-2 md:order-1"
              >
                <div className="flex items-center justify-center md:justify-end gap-2 mb-4">
                  <div className="h-[2px] w-12 bg-amber-500" />
                  <span className="text-amber-600 font-bold tracking-widest uppercase">The Groom</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-script text-amber-600 mb-6 drop-shadow-sm">Dimas Saktiawan</h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Putra dari Bpk. Alan & Ibu Alfatiha.<br />
                  Seorang pria yang penuh semangat dan mencintai teknologi. Baginya, cinta adalah kode yang tak perlu di-debug.
                </p>
                <div className="flex justify-center md:justify-end gap-4 text-amber-600">
                  <Camera className="w-6 h-6" /> <Music className="w-6 h-6" />
                </div>
              </motion.div>

              <div className="flex justify-center md:justify-start order-1 md:order-2">
                <TiltCard>
                  <motion.div
                    initial={{ scale: 0.8, rotate: -5 }}
                    whileInView={{ scale: 1, rotate: 3 }}
                    viewport={{ once: true }}
                    className="relative w-72 h-96 border-[12px] border-white shadow-2xl rounded-lg overflow-hidden"
                  >
                    <img src="/dimas.jpg" alt="Dimas" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </motion.div>
                </TiltCard>
              </div>
            </div>
          </div>

          {/* Bride */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center md:justify-end">
                <TiltCard>
                  <motion.div
                    initial={{ scale: 0.8, rotate: 5 }}
                    whileInView={{ scale: 1, rotate: -3 }}
                    viewport={{ once: true }}
                    className="relative w-72 h-96 border-[12px] border-white shadow-2xl rounded-lg overflow-hidden"
                  >
                    <img src="/davina.jpeg" alt="Davina" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </motion.div>
                </TiltCard>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, type: "spring" }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="text-amber-600 font-bold tracking-widest uppercase">The Bride</span>
                  <div className="h-[2px] w-12 bg-amber-500" />
                </div>
                <h2 className="text-5xl md:text-6xl font-script text-amber-600 mb-6 drop-shadow-sm">Davina Anandia</h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Putri dari Bpk. Zufar & Ibu Intan.<br />
                  Wanita anggun dengan senyum yang menghangatkan hati. Baginya, kebahagiaan adalah perjalanan, bukan tujuan.
                </p>
                <div className="flex justify-center md:justify-start gap-4 text-amber-600">
                  <Heart className="w-6 h-6" /> <Camera className="w-6 h-6" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* STORY SECTION */}
        <section className="py-24 bg-amber-50 relative">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-5xl font-script text-amber-700 mb-4">Our Love Story</h2>
              <p className="text-amber-600 uppercase tracking-widest">How We Met</p>
            </motion.div>

            <div className="relative">
              {/* Vertical Linet */}
              <motion.div
                className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-200/50 -translate-x-1/2 hidden md:block rounded-full"
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 2 }}
              />

              {[
                { year: "2023", title: "First Encounter", desc: "Awal perjumpaan di bangku sekolah SMK. Hanya teman sekelas yang saling berbagi catatan.", align: "right" },
                { year: "2025", title: "The Spark", desc: "Sebuah balasan Story Instagram yang sederhana memicu percakapan tak berujung hingga larut malam.", align: "left" },
                { year: "2026", title: "She Said Yes!", desc: "Di bawah langit Jakarta yang berbintang, janji suci terucap untuk selamanya.", align: "right" }
              ].map((item, i) => (
                <div key={i} className="relative grid md:grid-cols-2 gap-8 mb-12 items-center">
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.2), type: "spring" }}
                      className="w-6 h-6 bg-amber-500 rounded-full border-4 border-amber-100 shadow-lg"
                    />
                  </div>

                  {item.align === "left" ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -50, rotateY: 15 }}
                        whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-xl border border-amber-100 relative group hover:scale-105 transition-transform duration-300"
                      >
                        <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white transform rotate-45 hidden md:block" />
                        <span className="text-3xl font-bold text-amber-200/40 absolute top-2 right-4">{item.year}</span>
                        <h3 className="text-xl font-bold text-amber-700 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </motion.div>
                      <div className="hidden md:block" />
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block" />
                      <motion.div
                        initial={{ opacity: 0, x: 50, rotateY: -15 }}
                        whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-xl border border-amber-100 relative group hover:scale-105 transition-transform duration-300 md:text-right"
                      >
                        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white transform rotate-45 hidden md:block" />
                        <span className="text-3xl font-bold text-amber-200/40 absolute top-2 left-4">{item.year}</span>
                        <h3 className="text-xl font-bold text-amber-700 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </motion.div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EVENT DETAILS */}
        <AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="font-bold tracking-widest uppercase text-amber-600">The Details</p>
                <h2 className="text-5xl font-serif text-gray-800">Save The Date</h2>
                <p className="text-lg text-gray-600">
                  Kami menantikan kehadiran Anda untuk merayakan hari bahagia ini.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Calendar, title: "Holy Matrimony", info: "Monday, 02 February 2026", sub: "08:00 AM - 10:00 AM" },
                  { icon: Clock, title: "Wedding Reception", info: "Monday, 02 February 2026", sub: "11:00 AM - 01:00 PM" },
                  { icon: MapPin, title: "Location", info: "Politeknik Prestasi Prima", sub: "Jakarta Timur" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-6 p-6 rounded-2xl bg-white shadow-lg border border-amber-50"
                  >
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600">{item.info}</p>
                      <p className="text-amber-500 text-sm font-medium">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="h-[500px] w-full bg-white p-2 shadow-2xl rounded-3xl"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.4!2d106.907!3d-6.321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTknMTYuMCJTIDEwNsKwNTQnMjUuOCJF!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "20px" }}
                allowFullScreen
                loading="lazy"
              />
            </motion.div>
          </div>
        </AnimatedSection>

        {/* RSVP FORM - Only show if guest param exists */}
        {guest && (
          <section className="py-24 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
            <div className="max-w-xl mx-auto px-6 relative z-10 text-center">
              <Quote className="w-12 h-12 text-amber-200 mx-auto mb-6 transform rotate-180" />
              <h2 className="text-4xl font-serif mb-8">RSVP</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle submit logic here
                setIsSubmitting(true);
                fetch(`/api/guests/${guest.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ attendanceStatus: rsvpStatus, wishes }),
                  headers: { 'Content-Type': 'application/json' }
                }).then(() => {
                  setSubmitSuccess(true);
                  setIsSubmitting(false);
                  setTimeout(() => setSubmitSuccess(false), 3000);
                });
              }} className="space-y-6 bg-white p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4 justify-center">
                  <button type="button" onClick={() => setRsvpStatus('present')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${rsvpStatus === 'present' ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    Hadir
                  </button>
                  <button type="button" onClick={() => setRsvpStatus('absent')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${rsvpStatus === 'absent' ? 'bg-gray-700 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    Maaf
                  </button>
                </div>
                <textarea
                  value={wishes}
                  onChange={e => setWishes(e.target.value)}
                  placeholder="Tulis ucapan & doa..."
                  className="w-full p-4 bg-amber-50 rounded-xl border-0 focus:ring-2 focus:ring-amber-300 resize-none h-32"
                />
                <button disabled={isSubmitting} className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-amber-700 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : submitSuccess ? "Terkirim!" : "Kirim Konfirmasi"}
                </button>
              </form>
            </div>
          </section>
        )}

        <footer className="py-12 bg-[#1a1a2e] text-amber-100 text-center">
          <h2 className="font-script text-4xl mb-4">Dimas & Davina</h2>
          <p className="opacity-50 text-sm">Created with Love • 2026</p>
        </footer>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
