"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring, useMotionValue } from "framer-motion";
import { Heart, Calendar, Clock, MapPin, Volume2, VolumeX, Loader2, Camera, Music, Sparkles, Star, Quote, Github, Instagram } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  slug: string;
  attendanceStatus: string;
  wishes?: string;
}

// Music playlist configuration with start times (in seconds)
const PLAYLIST = [
  { src: "/music/Lana Del Rey - Young and Beautiful.webm", start: 148 }, // 2:28
  { src: "/music/Shane Filan - Beautiful In White.webm", start: 67 }     // 1:07
];

// ==================== LOADER COMPONENT ====================
function CustomLoader({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate asset loading - longer duration for heavyweight feel
    const duration = 2500; // 2.5 seconds load time
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onFinish, 500); // Small delay after 100%
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#fdfbf7] text-amber-600"
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Heart className="w-16 h-16 fill-current mb-8" />
      </motion.div>

      <h2 className="font-script text-3xl md:text-5xl mb-6">Dimas & Davina</h2>

      <div className="w-64 h-1 bg-amber-200 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full bg-amber-600 absolute left-0 top-0"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-sm tracking-widest uppercase opacity-60">
        {progress < 100 ? "Loading Memories..." : "Ready"}
      </p>
    </motion.div>
  );
}

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
            className="opacity-20 text-amber-400"
            style={{
              width: 10 + Math.random() * 20,
              height: 10 + Math.random() * 20,
            }}
            fill="currentColor"
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

// ==================== 3D TILT CARD (SAFE MOBILE) ====================
function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 50 }); // Add spring config
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });
  const [isMobile, setIsMobile] = useState(true); // Default strictly safe

  useEffect(() => {
    // Only enable tilt on desktop after mount to prevent hydration mismatch
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (isMobile) return;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  }

  // Always render motion.div to maintain consistency, just disable rotation effect on mobile
  // Rotate values will be 0 if isMobile (since x/y not updated), plus we short-circuit transform
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: "preserve-3d"
      }}
      className="perspective-1000 w-full flex justify-center will-change-transform" // optimize hint
    >
      {children}
    </motion.div>
  );
}

// ==================== ANIMATED SECTION ====================
function AnimatedSection({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" }); // Trigger earlier on mobile

  return (
    <motion.section
      ref={ref}
      className={`py-12 md:py-24 px-4 md:px-8 ${className}`}
      style={style}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto w-full">
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
    onPlayMusic();
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(60)].map((_, i) => (
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

      <div className="relative z-10 text-center w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="hello"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-amber-300 animate-pulse" />
              <p className="text-white/80 text-lg md:text-2xl tracking-[0.3em] uppercase font-light">Hello</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 2 && (
            <motion.div
              key="name"
              className="my-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <h1 className="text-4xl md:text-6xl font-script text-amber-200 drop-shadow-xl break-words px-2 leading-tight">
                {guest.name}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 3 && (
            <motion.div
              key="present"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <p className="text-white/80 text-base md:text-xl tracking-wide font-light border-y border-white/10 py-2 inline-block">
                We proudly present you to
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stage >= 4 && (
            <motion.div
              key="wedding"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mt-4"
            >
              <p className="text-white/60 text-xs md:text-sm tracking-[0.4em] uppercase mb-4">The Wedding of</p>
              <h2 className="text-5xl md:text-7xl font-script text-white mb-10 drop-shadow-2xl leading-none">
                Dimas <br /> <span className="text-3xl md:text-5xl opacity-50">&</span> <br /> Davina
              </h2>

              <motion.button
                onClick={handleOpen}
                className="w-full max-w-xs md:max-w-md px-8 py-4 rounded-full text-white font-medium shadow-2xl relative overflow-hidden group border border-white/20 backdrop-blur-md"
                style={{ background: "linear-gradient(135deg, rgba(230,185,128,0.9) 0%, rgba(201,160,80,0.9) 100%)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative flex items-center justify-center gap-3 text-sm md:text-lg tracking-widest uppercase">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                  Open Invitation
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ==================== WISHES SECTION ====================
function WishesSection() {
  const [wishes, setWishes] = useState<{ name: string, wishes: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishes")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWishes(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && wishes.length === 0) return null;

  return (
    <AnimatedSection className="bg-[#fcfaf7]">
      <div className="text-center mb-10 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/50 text-amber-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
          <Star className="w-3 h-3" /> Prayers & Wishes
        </div>
        <h2 className="text-3xl md:text-5xl font-script text-gray-800 mb-4">Doa & Ucapan</h2>
        <p className="text-gray-500 font-light max-w-lg mx-auto">
          Terima kasih atas segala doa dan harapan tulus yang telah Anda berikan untuk perjalanan baru kami.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
          {(loading ? [...Array(3)] : wishes).map((wish, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "50px" }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-amber-50 group hover:shadow-md transition-all"
            >
              {loading ? (
                <div className="animate-pulse flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0 shadow-inner">
                    {wish.name ? wish.name.charAt(0) : "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm md:text-base mb-1">{wish.name}</h4>
                    <p className="text-gray-600 text-sm italic leading-relaxed font-serif">"{wish.wishes}"</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {/* Helper gradient for scroll hint */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#fcfaf7] to-transparent pointer-events-none"></div>
      </div>
    </AnimatedSection>
  )
}

// ==================== HOME CONTENT ====================
function HomeContent() {
  const searchParams = useSearchParams();
  const guestSlug = searchParams.get("guest");

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true); // App level loading
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
        .finally(() => { });
    }
  }, [guestSlug]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      // Seek to start time if it's the first play or changed song
      // We handle seek in onLoadedMetadata, but here we just ensure play
      audioRef.current.play().then(() => {
        setIsMuted(false);
      }).catch(e => {
        console.warn("Autoplay blocked:", e);
        setIsMuted(true);
      });
    }
  };

  const handlePlayMusic = () => {
    playAudio();
  };

  const handleSongEnd = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentSongIndex && PLAYLIST.length > 1);
    setCurrentSongIndex(nextIndex);
  };

  // Handle song change and seeking
  const handleUnmute = () => {
    if (audioRef.current) {
      if (isMuted) {
        // If we are unmuting, check if we need to seek (if currently at 0)
        if (audioRef.current.currentTime < PLAYLIST[currentSongIndex].start) {
          audioRef.current.currentTime = PLAYLIST[currentSongIndex].start;
        }
        playAudio();
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  // Attempt autoplay when loading finishes
  useEffect(() => {
    if (!loading && audioRef.current && !showWelcome) {
      // Set start time immediately
      audioRef.current.currentTime = PLAYLIST[currentSongIndex].start;
      playAudio();
    }
  }, [loading, showWelcome]);

  // When song index changes, update source and seek
  useEffect(() => {
    if (audioRef.current && !loading) {
      // Wait for metadata to load to seek? 
      // Actually the audio tag src changes, we can set currentTime after it acts. 
      // Better to do it in onLoadedMetadata
    }
  }, [currentSongIndex, loading]);

  return (
    <>
      {/* Heavy Preloader */}
      <AnimatePresence mode="wait">
        {loading && <CustomLoader onFinish={() => setLoading(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && showWelcome && guest && (
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
        src={PLAYLIST[currentSongIndex].src}
        onEnded={handleSongEnd}
        preload="auto"
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          // If the current time is 0 (fresh load), seek to start
          if (audio.currentTime === 0) {
            audio.currentTime = PLAYLIST[currentSongIndex].start;
          }
          if (!isMuted && !loading && !showWelcome) {
            audio.play().catch(() => setIsMuted(true));
          }
        }}
      />

      {/* FAB Music */}
      {!loading && !showWelcome && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleUnmute}
          className="fixed bottom-6 right-6 z-50 p-3 md:p-4 rounded-full text-white shadow-2xl glass-effect"
          style={{ backgroundColor: "rgba(201, 160, 80, 0.9)", backdropFilter: "blur(4px)" }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={!isMuted ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
            {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
          </motion.div>
          {!isMuted && (
            <span className="absolute -inset-1 rounded-full animate-ping bg-amber-500/30" />
          )}
        </motion.button>
      )}

      {/* Main Content */}
      <div className={`overflow-x-hidden bg-[#fdfbf7] text-[#4a4a4a] ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
        <ClientOnly> <FloatingHearts /> </ClientOnly>

        {/* HERO SECTION */}
        <motion.section
          ref={heroRef}
          className="relative h-[100dvh] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="absolute inset-0 z-0 select-none">
            <div className="absolute inset-0 bg-black/30 z-10" />
            <motion.img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
              style={{ scale: heroScale }}
            />
          </div>

          <ClientOnly> <SparkleEffect /> </ClientOnly>

          <div className="relative z-20 text-white w-full max-w-4xl mx-auto flex flex-col items-center gap-6 md:gap-8 px-4">
            <motion.p
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm md:text-xl font-medium tracking-[0.3em] uppercase"
            >
              The Wedding of
            </motion.p>

            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", duration: 1.5 }}
              className="font-script text-5xl md:text-8xl lg:text-9xl drop-shadow-2xl text-amber-100 leading-tight"
            >
              Dimas <br className="md:hidden" /> <span className="text-3xl md:text-6xl align-middle">&</span> <br className="md:hidden" /> Davina
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-lg md:text-2xl font-serif italic border-y border-white/30 py-2 px-8"
            >
              Monday, 02 February 2026
            </motion.p>
          </div>

          <motion.div
            className="absolute bottom-10"
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-5 h-9 border-2 border-white rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </motion.div>
        </motion.section>

        {/* BRIDE & GROOM SECTION */}
        <div className="relative py-16 md:py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            {/* Groom */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-20 md:mb-32">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center md:text-right order-2 md:order-1"
              >
                <div className="flex items-center justify-center md:justify-end gap-3 mb-4">
                  <div className="h-[1px] w-8 md:w-16 bg-amber-500" />
                  <span className="text-amber-600/80 font-bold tracking-[0.2em] text-xs md:text-sm uppercase">The Groom</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-script text-amber-700 mb-4 md:mb-6">Dimas Saktiawan</h2>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                  Putra dari Bpk. Alan & Ibu Alfatiha.<br />
                  Pecinta teknologi yang percaya bahwa cinta sejati adalah algoritma tanpa batas.
                </p>
                <div className="flex justify-center md:justify-end gap-6 text-amber-600/70">
                  <Camera className="w-6 h-6" /> <Music className="w-6 h-6" />
                </div>
              </motion.div>

              <div className="flex justify-center md:justify-start order-1 md:order-2 w-full">
                <TiltCard>
                  <div className="relative w-64 h-80 md:w-80 md:h-[450px] border-[8px] md:border-[12px] border-white shadow-xl rounded-xl overflow-hidden transform rotate-2 md:rotate-3">
                    <img src="/dimas.jpg" alt="Dimas" className="w-full h-full object-cover" />
                  </div>
                </TiltCard>
              </div>
            </div>

            {/* Bride */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="flex justify-center md:justify-end w-full">
                <TiltCard>
                  <div className="relative w-64 h-80 md:w-80 md:h-[450px] border-[8px] md:border-[12px] border-white shadow-xl rounded-xl overflow-hidden transform -rotate-2 md:-rotate-3">
                    <img src="/davina.jpeg" alt="Davina" className="w-full h-full object-cover" />
                  </div>
                </TiltCard>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="text-amber-600/80 font-bold tracking-[0.2em] text-xs md:text-sm uppercase">The Bride</span>
                  <div className="h-[1px] w-8 md:w-16 bg-amber-500" />
                </div>
                <h2 className="text-4xl md:text-6xl font-script text-amber-700 mb-4 md:mb-6">Davina Anandia</h2>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                  Putri dari Bpk. Zufar & Ibu Intan.<br />
                  Wanita dengan senyuman hangat yang mampu menerangi setiap sudut hari.
                </p>
                <div className="flex justify-center md:justify-start gap-6 text-amber-600/70">
                  <Heart className="w-6 h-6" /> <Camera className="w-6 h-6" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* STORY SECTION - Optimized for Mobile */}
        <section className="py-20 md:py-32 bg-amber-50 relative">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <motion.div className="text-center mb-12 md:mb-20">
              <h2 className="text-4xl md:text-5xl font-script text-amber-700 mb-3">Our Love Story</h2>
              <p className="text-amber-600 uppercase tracking-widest text-xs md:text-sm">Small steps, huge journey</p>
            </motion.div>

            <div className="relative">
              {/* Vertical Line (Hidden on mobile) */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 -translate-x-1/2 rounded-full" />

              {[
                { year: "2023", title: "First Encounter", desc: "Pertama kali bertemu di SMK. Hanya sekadar teman sekelas biasa.", align: "right" },
                { year: "2025", title: "The Spark", desc: "Reply story Instagram yang berlanjut menjadi percakapan panjang.", align: "left" },
                { year: "2026", title: "Forever", desc: "Berjanji untuk saling menemani dalam suka dan duka selamanya.", align: "right" }
              ].map((item, i) => (
                <div key={i} className="relative grid grid-cols-[30px_1fr] md:grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-12 items-start md:items-center">

                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
                    <div className="w-4 h-4 md:w-6 md:h-6 bg-amber-500 rounded-full border-4 border-amber-100" />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`
                      bg-white p-6 rounded-2xl shadow-sm border border-amber-100 relative
                      col-start-2 
                      ${item.align === "left" ? "md:col-start-1 md:text-right md:mr-10" : "md:col-start-2 md:text-left md:ml-10"}
                    `}
                  >
                    <span className={`text-4xl font-bold text-amber-100 absolute top-2 select-none ${item.align === "left" ? "right-4 md:right-auto md:left-4" : "right-4"}`}>{item.year}</span>
                    <h3 className="text-lg md:text-xl font-bold text-amber-700 mb-2 relative z-10">{item.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 relative z-10">{item.desc}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EVENT DETAILS - Mobile Card Stack */}
        <AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
              <div className="space-y-2 md:space-y-4 text-center lg:text-left">
                <p className="font-bold tracking-widest uppercase text-amber-600 text-sm">The Details</p>
                <h2 className="text-4xl md:text-5xl font-serif text-gray-800">Save The Date</h2>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Calendar, title: "Holy Matrimony", info: "Monday, 02 February 2026", sub: "08:00 AM" },
                  { icon: Clock, title: "Wedding Reception", info: "Monday, 02 February 2026", sub: "11:00 AM" },
                  { icon: MapPin, title: "Location", info: "Politeknik Prestasi Prima", sub: "Jakarta Timur" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-white shadow-md border border-amber-50 hover:shadow-lg transition-shadow">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                      <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm md:text-base text-gray-600">{item.info}</p>
                      <p className="text-amber-500 text-xs md:text-sm font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[300px] md:h-[500px] w-full bg-white p-2 shadow-2xl rounded-3xl order-1 lg:order-2 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.4!2d106.907!3d-6.321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTknMTYuMCJTIDEwNsKwNTQnMjUuOCJF!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "20px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* RSVP CARD */}
        {guest && (
          <section className="py-16 md:py-24 px-4 bg-gradient-to-t from-amber-50 to-white">
            <div className="max-w-xl mx-auto relative z-10 text-center">
              <Quote className="w-8 h-8 md:w-12 md:h-12 text-amber-200 mx-auto mb-4 md:mb-6 transform rotate-180" />
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-amber-800">Attendance</h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                setIsSubmitting(true);
                fetch(`/api/guests/${guest.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ attendanceStatus: rsvpStatus, wishes }),
                  headers: { 'Content-Type': 'application/json' }
                }).then(() => {
                  setSubmitSuccess(true);
                  setIsSubmitting(false);
                  // Refresh wishes list if we had a query client, or just let users see it next time
                });
              }} className="space-y-4 md:space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-amber-100">

                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <button type="button" onClick={() => setRsvpStatus('present')}
                    className={`py-3 md:py-4 px-6 rounded-xl font-medium transition-all text-sm md:text-base ${rsvpStatus === 'present' ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                    Saya Hadir
                  </button>
                  <button type="button" onClick={() => setRsvpStatus('absent')}
                    className={`py-3 md:py-4 px-6 rounded-xl font-medium transition-all text-sm md:text-base ${rsvpStatus === 'absent' ? 'bg-gray-700 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                    Maaf, Tidak Bisa
                  </button>
                </div>

                <textarea
                  value={wishes}
                  onChange={e => setWishes(e.target.value)}
                  placeholder="Ucapan & doa restu..."
                  className="w-full p-4 bg-amber-50/50 rounded-xl border border-amber-100 focus:ring-2 focus:ring-amber-200 resize-none h-32 md:h-40 text-sm md:text-base"
                />

                <button disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : submitSuccess ? "Terkirim! Terima Kasih" : "Kirim Konfirmasi"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* WISHES & PRAYERS SECTION */}
        <WishesSection />

        <footer className="py-12 bg-[#1a1a2e] text-amber-100 text-center px-4">
          <h2 className="font-script text-3xl md:text-4xl mb-4">Dimas & Davina</h2>
          <p className="opacity-50 text-xs md:text-sm">Created with Love • 2026</p>

          <div className="flex justify-center items-center gap-6 mt-8">
            <a
              href="https://github.com/ujangPNG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all hover:text-white group"
            >
              <Github className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm tracking-wide">Made by ujangPNG</span>
            </a>

            <div className="w-px h-4 bg-white/20"></div>

            <a
              href="https://www.instagram.com/eunoikos._/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all hover:text-pink-400 group"
            >
              <Instagram className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm tracking-wide">Know more about us!</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#fdfbf7] md:bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}
