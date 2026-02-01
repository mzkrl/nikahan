"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Calendar, Clock, MapPin, Volume2, VolumeX, Loader2, Camera, Music, Sparkles, Star } from "lucide-react";

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

// ==================== FLOATING ELEMENTS ====================
function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        >
          <Heart
            className="opacity-10"
            style={{
              color: "#c9a050",
              width: 12 + Math.random() * 20,
              height: 12 + Math.random() * 20,
            }}
            fill="#c9a050"
          />
        </motion.div>
      ))}
    </div>
  );
}

// ==================== SPARKLE EFFECT ====================
function SparkleEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `linear-gradient(135deg, #e6b980, #c9a050)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
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
function WelcomeOverlay({ guest, onComplete }: { guest: Guest; onComplete: () => void }) {
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

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 1 + Math.random() * 3,
              height: 1 + Math.random() * 3,
              background: "white",
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

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(230,185,128,0.3) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="hello"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-4 text-amber-300" />
              </motion.div>
              <p className="text-white/80 text-xl md:text-2xl tracking-[0.3em] uppercase font-light">
                Hello
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 2 && (
            <motion.h1
              key="name"
              className="text-4xl md:text-6xl lg:text-7xl font-script my-8"
              style={{ color: "#e6b980", textShadow: "0 0 60px rgba(230, 185, 128, 0.6)" }}
              initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", type: "spring", bounce: 0.3 }}
            >
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 40px rgba(230, 185, 128, 0.5)",
                    "0 0 80px rgba(230, 185, 128, 0.8)",
                    "0 0 40px rgba(230, 185, 128, 0.5)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {guest.name}
              </motion.span>
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 3 && (
            <motion.div
              key="present"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-32 h-[2px] mx-auto mb-6"
                style={{ background: "linear-gradient(to right, transparent, #e6b980, transparent)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
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
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-8"
            >
              <motion.p
                className="text-white/60 text-sm tracking-[0.5em] uppercase mb-4"
                animate={{ letterSpacing: ["0.5em", "0.6em", "0.5em"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                The Wedding of
              </motion.p>
              <motion.h2
                className="text-5xl md:text-7xl lg:text-8xl font-script text-white mb-12"
                style={{ textShadow: "0 0 80px rgba(255, 255, 255, 0.4)" }}
                animate={{
                  textShadow: [
                    "0 0 60px rgba(255, 255, 255, 0.3)",
                    "0 0 100px rgba(255, 255, 255, 0.5)",
                    "0 0 60px rgba(255, 255, 255, 0.3)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Dimas & Davina
              </motion.h2>

              <motion.button
                onClick={onComplete}
                className="px-12 py-5 rounded-full text-white font-medium shadow-2xl transition-all relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, #e6b980 0%, #c9a050 100%)" }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(230, 185, 128, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Open Invitation
                  <Sparkles className="w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-20"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Star className="w-8 h-8 text-amber-300/30" fill="currentColor" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-20"
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        <Heart className="w-10 h-10 text-pink-300/30" fill="currentColor" />
      </motion.div>
      <motion.div
        className="absolute top-40 right-32"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      >
        <Sparkles className="w-6 h-6 text-amber-200/40" />
      </motion.div>
    </motion.div>
  );
}

// ==================== PARALLAX IMAGE ====================
function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className="relative overflow-hidden rounded-t-full border-8 border-white shadow-2xl">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ y }}
      />
    </div>
  );
}

// ==================== ANIMATED CARD ====================
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: 15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 15 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="transition-shadow"
    >
      {children}
    </motion.div>
  );
}

// ==================== HOME CONTENT ====================
function HomeContent() {
  const searchParams = useSearchParams();
  const guestSlug = searchParams.get("guest");

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted for autoplay
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

  // Random song on mount + set volume to 50%
  useEffect(() => {
    setCurrentSongIndex(Math.floor(Math.random() * PLAYLIST.length));
  }, []);

  // Set volume to 50% when audio element is ready
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, [audioRef.current]);

  // Fetch guest data
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
            setRsvpStatus(data.attendanceStatus || "pending");
            setWishes(data.wishes || "");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [guestSlug]);

  // GSAP animations
  useEffect(() => {
    if (!showWelcome && heroRef.current) {
      // Hero text animation
      gsap.fromTo(
        ".hero-text",
        { y: 100, opacity: 0, rotateX: 30 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.3 }
      );

      // Scroll-triggered animations for sections
      gsap.utils.toArray(".animate-on-scroll").forEach((el: any) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      });
    }
  }, [showWelcome]);

  const handleSongEnd = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentSongIndex && PLAYLIST.length > 1);
    setCurrentSongIndex(nextIndex);
  };

  // Autoplay music
  useEffect(() => {
    if (audioRef.current && !isMuted && !showWelcome) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(console.error);
    }
  }, [currentSongIndex, isMuted, showWelcome]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(console.error);
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  const handleWelcomeComplete = () => {
    if (guestSlug) {
      sessionStorage.setItem(`welcome-${guestSlug}`, "true");
    }
    setShowWelcome(false);
    // Autoplay music after welcome
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(console.error);
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest || rsvpStatus === "pending") return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/guests/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceStatus: rsvpStatus, wishes }),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      console.error("RSVP submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12" style={{ color: "var(--primary)" }} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && guest && (
          <WelcomeOverlay guest={guest} onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>

      {/* Background Music - Autoplay at 50% */}
      <audio
        ref={audioRef}
        src={PLAYLIST[currentSongIndex]}
        onEnded={handleSongEnd}
        autoPlay={!showWelcome}
      />

      {/* Floating Hearts Background */}
      <FloatingHearts />

      {/* Music Toggle Button with pulse animation */}
      <motion.button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-lg"
        style={{ backgroundColor: "hsl(38, 45%, 55%)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={!isMuted ? {
          boxShadow: [
            "0 0 0 0 rgba(201, 160, 80, 0.4)",
            "0 0 0 20px rgba(201, 160, 80, 0)",
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </motion.button>

      <div className="overflow-x-hidden" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        {/* Background Pattern */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }}
        />

        {/* HERO SECTION with Parallax */}
        <motion.section
          ref={heroRef}
          className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <div className="absolute inset-0 z-0">
            <motion.div
              className="absolute inset-0 bg-black/40 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />
            <motion.img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>

          <SparkleEffect />

          <div className="relative z-20 text-white max-w-4xl mx-auto space-y-6 md:space-y-8">
            <motion.p
              className="hero-text text-lg md:text-xl font-medium tracking-[0.3em] uppercase"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              The Wedding of
            </motion.p>

            <h1 className="hero-text font-script text-6xl md:text-8xl lg:text-9xl drop-shadow-lg" style={{ color: "#e6b980" }}>
              Dimas & Davina
            </h1>

            <motion.div
              className="hero-text w-24 h-1 bg-white/80 mx-auto rounded-full"
              animate={{ scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <p className="hero-text text-xl md:text-2xl font-serif italic">
              Monday, 02 February 2025
            </p>

            {guest && (
              <motion.div
                className="hero-text mt-12 bg-white/10 backdrop-blur-md px-8 py-6 rounded-xl border border-white/20 inline-block"
                whileHover={{ scale: 1.02, borderColor: "rgba(230, 185, 128, 0.5)" }}
              >
                <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Dear Special Guest</p>
                <motion.p
                  className="text-3xl font-serif font-bold"
                  animate={{ color: ["#ffffff", "#e6b980", "#ffffff"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {guest.name}
                </motion.p>
              </motion.div>
            )}
          </div>

          {/* Animated scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-0 right-0 z-20 flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1.5 h-3 bg-white rounded-full"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.section>

        {/* GROOM SECTION */}
        <AnimatedSection className="bg-secondary/30">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="order-2 md:order-1 text-center md:text-right space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2
                className="text-5xl md:text-6xl font-script"
                style={{ color: "var(--primary)" }}
                whileInView={{ scale: [0.9, 1] }}
                viewport={{ once: true }}
              >
                Dimas Saktiawan
              </motion.h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                The son of Mr. Alan & Mrs. Alfatiha. <br />
                A man of few words but endless love. A dedicated developer and loving partner.
              </p>
              <motion.div
                className="flex justify-center md:justify-end gap-4"
                style={{ color: "var(--primary)" }}
              >
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: "spring" }}>
                  <Camera className="w-6 h-6 opacity-60" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.2, rotate: -10 }} transition={{ type: "spring" }}>
                  <Music className="w-6 h-6 opacity-60" />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="order-1 md:order-2 flex justify-center md:justify-start"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="relative w-64 h-80 md:w-80 md:h-96"
                whileHover={{ rotate: 0 }}
                initial={{ rotate: 3 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <ParallaxImage src="/dimas.jpg" alt="The Groom - Dimas" />
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* BRIDE SECTION */}
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="flex justify-center md:justify-end"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="relative w-64 h-80 md:w-80 md:h-96"
                whileHover={{ rotate: 0 }}
                initial={{ rotate: -3 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <ParallaxImage src="/davina.jpeg" alt="The Bride - Davina" />
              </motion.div>
            </motion.div>
            <motion.div
              className="text-center md:text-left space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-5xl md:text-6xl font-script" style={{ color: "var(--primary)" }}>
                Davina Anandia
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                The daughter of Mr. Zufar & Mrs. Intan. <br />
                A radiant soul with a heart of gold. She brings light and warmth to everyone.
              </p>
              <div className="flex justify-center md:justify-start gap-4" style={{ color: "var(--primary)" }}>
                <motion.div whileHover={{ scale: 1.2 }} transition={{ type: "spring" }}>
                  <Heart className="w-6 h-6 opacity-60" fill="currentColor" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.2 }} transition={{ type: "spring" }}>
                  <Camera className="w-6 h-6 opacity-60" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* QUOTE SECTION */}
        <motion.section
          className="py-24 text-center px-4 relative overflow-hidden"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <SparkleEffect />
          <motion.div
            className="max-w-3xl mx-auto space-y-6 relative z-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 mx-auto fill-current opacity-80" />
            </motion.div>
            <blockquote className="text-2xl md:text-4xl font-serif italic leading-relaxed">
              &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them.&rdquo;
            </blockquote>
            <p className="text-lg opacity-80 font-medium tracking-wide">— Ar-Rum 30:21</p>
          </motion.div>
        </motion.section>

        {/* STORY TIMELINE SECTION */}
        <AnimatedSection className="bg-secondary/30">
          <div className="text-center mb-16">
            <motion.p
              className="font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--primary)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Journey
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-serif"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              How We Met
            </motion.h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Animated vertical line */}
            <motion.div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
              style={{ backgroundColor: "hsl(38, 45%, 55%, 0.3)" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />

            {[
              { year: "2023", title: "High School Days", text: "We were classmates in vocational school. Just friends sharing notes and dreams.", align: "right" },
              { year: "2025", title: "Reconnected", text: "A simple reply to an Instagram story sparked a conversation that never ended.", align: "left" },
              { year: "2026", title: "The Proposal", text: "Under the stars in Jakarta, he asked the question, and she said \"Yes\" forever.", align: "right" },
            ].map((item, i) => (
              <div key={i} className="relative grid md:grid-cols-2 gap-8 mb-12 items-center">
                {item.align === "right" ? (
                  <>
                    <AnimatedCard delay={i * 0.2}>
                      <div className="md:text-right p-6 bg-white rounded-xl shadow-sm border border-transparent hover:border-amber-200 transition-all">
                        <motion.span
                          className="font-bold text-xl block mb-2"
                          style={{ color: "var(--primary)" }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {item.year}
                        </motion.span>
                        <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                        <p style={{ color: "var(--muted-foreground)" }}>{item.text}</p>
                      </div>
                    </AnimatedCard>
                    <div className="hidden md:flex justify-center">
                      <motion.div
                        className="w-5 h-5 rounded-full ring-4 ring-amber-200/50"
                        style={{ backgroundColor: "var(--primary)" }}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                        whileHover={{ scale: 1.3 }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden md:block" />
                    <div className="hidden md:flex justify-center">
                      <motion.div
                        className="w-5 h-5 rounded-full ring-4 ring-amber-200/50"
                        style={{ backgroundColor: "var(--primary)" }}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                        whileHover={{ scale: 1.3 }}
                      />
                    </div>
                    <AnimatedCard delay={i * 0.2}>
                      <div className="p-6 bg-white rounded-xl shadow-sm border border-transparent hover:border-amber-200 transition-all md:col-start-1 md:row-start-1">
                        <motion.span
                          className="font-bold text-xl block mb-2"
                          style={{ color: "var(--primary)" }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {item.year}
                        </motion.span>
                        <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                        <p style={{ color: "var(--muted-foreground)" }}>{item.text}</p>
                      </div>
                    </AnimatedCard>
                  </>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* EVENT DETAILS */}
        <AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div className="space-y-4">
                <motion.p
                  className="font-bold tracking-widest uppercase"
                  style={{ color: "var(--primary)" }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  The Details
                </motion.p>
                <motion.h2
                  className="text-4xl md:text-5xl font-serif"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Save The Date
                </motion.h2>
                <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
                  We can&apos;t wait to celebrate our special day with you.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Calendar, title: "Holy Matrimony", date: "Monday, 02 February 2026", time: "08:00 AM - 10:00 AM" },
                  { icon: Clock, title: "Wedding Reception", date: "Monday, 02 February 2026", time: "11:00 AM - 01:00 PM" },
                ].map((event, i) => (
                  <AnimatedCard key={i} delay={i * 0.15}>
                    <div
                      className="flex items-start gap-6 p-6 rounded-2xl transition-all hover:shadow-lg"
                      style={{ backgroundColor: "hsl(40, 20%, 94%, 0.5)" }}
                    >
                      <motion.div
                        className="bg-white p-3 rounded-full shadow-sm"
                        style={{ color: "var(--primary)" }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <event.icon className="w-6 h-6" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold font-serif mb-1">{event.title}</h3>
                        <p className="mb-2" style={{ color: "var(--muted-foreground)" }}>{event.date}</p>
                        <p className="font-medium">{event.time}</p>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}

                <AnimatedCard delay={0.3}>
                  <div
                    className="flex items-start gap-6 p-6 rounded-2xl transition-all hover:shadow-lg"
                    style={{ backgroundColor: "hsl(40, 20%, 94%, 0.5)" }}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-full shadow-sm"
                      style={{ color: "var(--primary)" }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <MapPin className="w-6 h-6" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold font-serif mb-1">Location</h3>
                      <p className="mb-2" style={{ color: "var(--muted-foreground)" }}>Politeknik Prestasi Prima</p>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>
                        RW.5, Bambu Apus Kec. Cipayung Jakarta Timur
                      </p>
                      <motion.a
                        href="https://maps.google.com/?q=-6.32109656207519,106.90716737036655"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-sm font-bold hover:underline"
                        style={{ color: "var(--primary)" }}
                        whileHover={{ x: 5 }}
                      >
                        Open in Google Maps →
                      </motion.a>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>

            {/* Map */}
            <motion.div
              className="h-full flex flex-col gap-8"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-xl flex-1 min-h-[400px] border-4 border-white">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.4!2d106.907!3d-6.321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTknMTYuMCJTIDEwNsKwNTQnMjUuOCJF!5e0!3m2!1sen!2sid!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* RSVP SECTION */}
        {guest && (
          <AnimatedSection className="relative overflow-hidden" style={{ backgroundColor: "hsl(40, 20%, 94%, 0.4)" }}>
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
              style={{ backgroundColor: "hsl(38, 45%, 55%, 0.1)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
              style={{ backgroundColor: "hsl(38, 45%, 55%, 0.1)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-amber-500" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif" style={{ color: "var(--primary)" }}>
                Attendance
              </h2>
              <p style={{ color: "var(--muted-foreground)" }}>
                Please let us know if you can join us in celebrating our love.
              </p>

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setRsvpStatus("present")}
                    className={`px-8 py-4 rounded-full border-2 font-medium transition-all ${rsvpStatus === "present" ? "text-white shadow-lg" : ""
                      }`}
                    style={{
                      backgroundColor: rsvpStatus === "present" ? "var(--primary)" : "transparent",
                      borderColor: "var(--primary)",
                      color: rsvpStatus === "present" ? "white" : "var(--primary)",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✓ Will Attend
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setRsvpStatus("absent")}
                    className={`px-8 py-4 rounded-full border-2 font-medium transition-all ${rsvpStatus === "absent"
                      ? "bg-gray-700 text-white border-gray-700 shadow-lg"
                      : "border-gray-400 text-gray-600"
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✗ Cannot Attend
                  </motion.button>
                </div>

                <motion.textarea
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Send your wishes to the couple... 💕"
                  className="w-full p-5 rounded-xl border-2 focus:ring-2 focus:border-transparent resize-none bg-white shadow-sm"
                  style={{ borderColor: "var(--border)" }}
                  rows={4}
                  whileFocus={{ scale: 1.02 }}
                />

                <motion.button
                  type="submit"
                  disabled={isSubmitting || rsvpStatus === "pending"}
                  className="px-12 py-4 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  style={{ backgroundColor: "var(--primary)" }}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(201, 160, 80, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Loader2 className="w-5 h-5" />
                      </motion.span>
                      Sending...
                    </span>
                  ) : submitSuccess ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Sent Successfully!
                    </span>
                  ) : (
                    "Send Response"
                  )}
                </motion.button>
              </form>
            </div>
          </AnimatedSection>
        )}

        {/* FOOTER */}
        <motion.footer
          className="py-16 text-center relative overflow-hidden"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <SparkleEffect />
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="font-script text-5xl mb-4"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.3)",
                  "0 0 40px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.3)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Dimas & Davina
            </motion.h2>
            <p className="text-lg opacity-80 mb-8">02 . 02 . 2026</p>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 mx-auto fill-current opacity-60 mb-6" />
            </motion.div>
            <p className="text-sm opacity-60">
              Created with ❤️ for our special day<br />
              © 2026 All Rights Reserved
            </p>
          </motion.div>
        </motion.footer>
      </div>
    </>
  );
}

// ==================== MAIN EXPORT ====================
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Heart className="w-16 h-16" style={{ color: "var(--primary)" }} fill="currentColor" />
        </motion.div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
