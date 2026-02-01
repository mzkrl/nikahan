"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Heart, Calendar, Clock, MapPin, Volume2, VolumeX, Loader2, Camera, Music } from "lucide-react";

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

// ==================== WELCOME OVERLAY ====================
function WelcomeOverlay({ guest, onComplete }: { guest: Guest; onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),   // Show "Hello"
      setTimeout(() => setStage(2), 2000),  // Show guest name
      setTimeout(() => setStage(3), 4000),  // Show "We proudly present"
      setTimeout(() => setStage(4), 6000),  // Show couple names
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Background particles/stars */}
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
              className="text-4xl md:text-6xl lg:text-7xl font-script mb-8"
              style={{ color: "#e6b980", textShadow: "0 0 40px rgba(230, 185, 128, 0.5)" }}
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
                className="w-24 h-[1px] mx-auto mb-6"
                style={{ background: "linear-gradient(to right, transparent, #e6b980, transparent)" }}
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
                className="text-5xl md:text-7xl lg:text-8xl font-script text-white mb-12"
                style={{ textShadow: "0 0 60px rgba(255, 255, 255, 0.3)" }}
              >
                Dimas & Davina
              </h2>

              <motion.button
                onClick={onComplete}
                className="px-10 py-4 rounded-full text-white font-medium shadow-xl transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #e6b980 0%, #c9a050 100%)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Open Invitation
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom gradient */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </motion.div>
  );
}

// ==================== SECTION COMPONENT ====================
function Section({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <section className={`py-16 md:py-24 px-4 md:px-8 ${className}`} style={style}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}

// ==================== HOME CONTENT ====================
function HomeContent() {
  const searchParams = useSearchParams();
  const guestSlug = searchParams.get("guest");

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string>("pending");
  const [wishes, setWishes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Random song on mount
  useEffect(() => {
    setCurrentSongIndex(Math.floor(Math.random() * PLAYLIST.length));
  }, []);

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

  // GSAP hero animation
  useEffect(() => {
    if (!showWelcome && heroRef.current) {
      gsap.fromTo(
        ".hero-text",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.5 }
      );
    }
  }, [showWelcome]);

  const handleSongEnd = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentSongIndex && PLAYLIST.length > 1);
    setCurrentSongIndex(nextIndex);
  };

  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentSongIndex, isMuted]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
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
    setIsMuted(false);
    if (audioRef.current) {
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
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--primary)" }} />
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

      {/* Background Music */}
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={handleSongEnd} />

      {/* Music Toggle Button */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: "hsl(38, 45%, 55%, 0.9)" }}
        aria-label={isMuted ? "Play music" : "Mute music"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <div className="overflow-x-hidden" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        {/* Background Pattern */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }}
        />

        {/* HERO SECTION */}
        <section ref={heroRef} className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 text-white max-w-4xl mx-auto space-y-6 md:space-y-8">
            <p className="hero-text text-lg md:text-xl font-medium tracking-[0.2em] uppercase">
              The Wedding of
            </p>

            <h1 className="hero-text font-script text-6xl md:text-8xl lg:text-9xl drop-shadow-lg" style={{ color: "#e6b980" }}>
              Dimas & Davina
            </h1>

            <div className="hero-text w-24 h-1 bg-white/80 mx-auto rounded-full" />

            <p className="hero-text text-xl md:text-2xl font-serif italic">
              Monday, 02 February 2025
            </p>

            {guest && (
              <div className="hero-text mt-12 bg-white/10 backdrop-blur-md px-8 py-6 rounded-xl border border-white/20 inline-block">
                <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Dear Special Guest</p>
                <p className="text-3xl font-serif font-bold">{guest.name}</p>
              </div>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center animate-bounce">
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-white rounded-full" />
            </div>
          </div>
        </section>

        {/* GROOM SECTION */}
        <Section className="bg-secondary/30">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 text-center md:text-right space-y-6">
              <h2 className="text-5xl md:text-6xl font-script" style={{ color: "var(--primary)" }}>Dimas Saktiawan</h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                The son of Mr. Alan & Mrs. Alfatiha. <br />
                A man of few words but endless love. A dedicated developer and a loving partner who found his perfect match in the code of life.
              </p>
              <div className="flex justify-center md:justify-end gap-4" style={{ color: "var(--primary)" }}>
                <Camera className="w-6 h-6 opacity-60" />
                <Music className="w-6 h-6 opacity-60" />
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center md:justify-start">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full overflow-hidden border-8 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img src="/dimas.jpg" alt="The Groom - Dimas" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </Section>

        {/* BRIDE SECTION */}
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full overflow-hidden border-8 border-white shadow-2xl -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img src="/davina.jpeg" alt="The Bride - Davina" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-6">
              <h2 className="text-5xl md:text-6xl font-script" style={{ color: "var(--primary)" }}>Davina Anandia</h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                The daughter of Mr. Zufar & Mrs. Intan. <br />
                A radiant soul with a heart of gold. She brings light, laughter, and warmth to everyone she meets.
              </p>
              <div className="flex justify-center md:justify-start gap-4" style={{ color: "var(--primary)" }}>
                <Heart className="w-6 h-6 opacity-60" />
                <Camera className="w-6 h-6 opacity-60" />
              </div>
            </div>
          </div>
        </Section>

        {/* QUOTE SECTION */}
        <section className="py-24 text-center px-4" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
          <div className="max-w-3xl mx-auto space-y-6">
            <Heart className="w-12 h-12 mx-auto fill-current opacity-80" />
            <blockquote className="text-2xl md:text-4xl font-serif italic leading-relaxed">
              &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.&rdquo;
            </blockquote>
            <p className="text-lg opacity-80 font-medium tracking-wide">— Ar-Rum 30:21</p>
          </div>
        </section>

        {/* STORY SECTION */}
        <Section className="bg-secondary/30">
          <div className="text-center mb-16">
            <p className="font-bold tracking-widest uppercase mb-2" style={{ color: "var(--primary)" }}>Our Journey</p>
            <h2 className="text-4xl md:text-5xl font-serif">How We Met</h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block" style={{ backgroundColor: "hsl(38, 45%, 55%, 0.3)" }} />

            {[
              { year: "2023", title: "High School Days", text: "We were classmates in vocational school. Just friends sharing notes and dreams, unaware of what the future held.", align: "right" },
              { year: "2025", title: "Reconnected", text: "After a semester apart, a simple reply to an Instagram story sparked a conversation that never ended.", align: "left" },
              { year: "2026", title: "The Proposal", text: "Under the stars in Jakarta, he asked the question, and she said \"Yes\" to a lifetime together.", align: "right" },
            ].map((item, i) => (
              <div key={i} className="relative grid md:grid-cols-2 gap-8 mb-12 items-center">
                {item.align === "right" ? (
                  <>
                    <div className="md:text-right p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
                      <span className="font-bold text-lg block mb-2" style={{ color: "var(--primary)" }}>{item.year}</span>
                      <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                      <p style={{ color: "var(--muted-foreground)" }}>{item.text}</p>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <div className="w-4 h-4 rounded-full ring-4 ring-[hsl(38,45%,55%,0.2)]" style={{ backgroundColor: "var(--primary)" }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden md:block" />
                    <div className="hidden md:flex justify-center">
                      <div className="w-4 h-4 rounded-full ring-4 ring-[hsl(38,45%,55%,0.2)]" style={{ backgroundColor: "var(--primary)" }} />
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow md:col-start-1 md:row-start-1" style={{ borderColor: "var(--border)" }}>
                      <span className="font-bold text-lg block mb-2" style={{ color: "var(--primary)" }}>{item.year}</span>
                      <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                      <p style={{ color: "var(--muted-foreground)" }}>{item.text}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* EVENT DETAILS */}
        <Section>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="font-bold tracking-widest uppercase" style={{ color: "var(--primary)" }}>The Details</p>
                <h2 className="text-4xl md:text-5xl font-serif">Save The Date</h2>
                <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>We can&apos;t wait to celebrate our special day with you.</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6 p-6 rounded-2xl" style={{ backgroundColor: "hsl(40, 20%, 94%, 0.3)" }}>
                  <div className="bg-white p-3 rounded-full shadow-sm" style={{ color: "var(--primary)" }}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Holy Matrimony</h3>
                    <p className="mb-2" style={{ color: "var(--muted-foreground)" }}>Monday, 02 February 2026</p>
                    <p className="font-medium">08:00 AM - 10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 rounded-2xl" style={{ backgroundColor: "hsl(40, 20%, 94%, 0.3)" }}>
                  <div className="bg-white p-3 rounded-full shadow-sm" style={{ color: "var(--primary)" }}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Wedding Reception</h3>
                    <p className="mb-2" style={{ color: "var(--muted-foreground)" }}>Monday, 02 February 2026</p>
                    <p className="font-medium">11:00 AM - 01:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 rounded-2xl" style={{ backgroundColor: "hsl(40, 20%, 94%, 0.3)" }}>
                  <div className="bg-white p-3 rounded-full shadow-sm" style={{ color: "var(--primary)" }}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Location</h3>
                    <p className="mb-2" style={{ color: "var(--muted-foreground)" }}>Politeknik Prestasi Prima</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>
                      RW.5, Bambu Apus Kec. Cipayung Kota Jakarta Timur Daerah Khusus Ibukota Jakarta
                    </p>
                    <a
                      href="https://maps.google.com/?q=-6.32109656207519,106.90716737036655"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-sm font-bold hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="h-full flex flex-col gap-8">
              <div className="rounded-2xl overflow-hidden shadow-lg flex-1 min-h-[400px]" style={{ borderColor: "var(--border)" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.4!2d106.907!3d-6.321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTknMTYuMCJTIDEwNsKwNTQnMjUuOCJF!5e0!3m2!1sen!2sid!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* RSVP SECTION */}
        {guest && (
          <Section className="relative overflow-hidden" style={{ backgroundColor: "hsl(40, 20%, 94%, 0.4)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: "hsl(38, 45%, 55%, 0.05)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: "hsl(38, 45%, 55%, 0.05)" }} />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif" style={{ color: "var(--primary)" }}>Attendance</h2>
              <p style={{ color: "var(--muted-foreground)" }}>Please let us know if you can join us in celebrating our love.</p>

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("present")}
                    className={`px-6 py-3 rounded-full border-2 transition-all font-medium ${rsvpStatus === "present"
                      ? "text-white shadow-lg"
                      : "hover:opacity-80"
                      }`}
                    style={{
                      backgroundColor: rsvpStatus === "present" ? "var(--primary)" : "transparent",
                      borderColor: "var(--primary)",
                      color: rsvpStatus === "present" ? "white" : "var(--primary)",
                    }}
                  >
                    ✓ Will Attend
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("absent")}
                    className={`px-6 py-3 rounded-full border-2 transition-all font-medium ${rsvpStatus === "absent"
                      ? "bg-gray-700 text-white border-gray-700 shadow-lg"
                      : "border-gray-400 text-gray-600 hover:opacity-80"
                      }`}
                  >
                    ✗ Cannot Attend
                  </button>
                </div>

                <textarea
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Send your wishes to the couple... 💕"
                  className="w-full p-4 rounded-xl border focus:ring-2 focus:border-transparent resize-none bg-white"
                  style={{ borderColor: "var(--border)", outlineColor: "var(--primary)" }}
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || rsvpStatus === "pending"}
                  className="px-10 py-4 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </span>
                  ) : submitSuccess ? (
                    "✓ Sent Successfully!"
                  ) : (
                    "Send Response"
                  )}
                </button>
              </form>
            </div>
          </Section>
        )}

        {/* FOOTER */}
        <footer className="py-12 text-center" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
          <h2 className="font-script text-4xl mb-4">Dimas & Davina</h2>
          <p className="text-sm opacity-80 mb-8">02 . 02 . 2026</p>
          <p className="text-xs opacity-60">
            Created with ❤️ for our special day<br />
            © 2026 All Rights Reserved
          </p>
        </footer>
      </div>
    </>
  );
}

// ==================== MAIN EXPORT ====================
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
