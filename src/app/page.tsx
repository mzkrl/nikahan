"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, Clock, MapPin, Volume2, VolumeX, Loader2, Camera, Music } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  slug: string;
  attendanceStatus: string;
  wishes?: string;
}

// Music playlist - randomized on load
const PLAYLIST = [
  "/music/Lana Del Rey - Young and Beautiful.webm",
  "/music/Shane Filan - Beautiful In White.webm",
  "/music/Wedding Nasheed.webm"
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function WelcomeOverlay({ guest, onComplete }: { guest: Guest; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center text-white space-y-8 p-8 max-w-lg"
      >
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg tracking-[0.3em] uppercase opacity-80"
        >
          You Are Cordially Invited
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <Heart className="w-12 h-12 mx-auto text-amber-400 fill-amber-400" />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-5xl md:text-7xl font-script text-amber-200"
        >
          Dimas & Davina
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.1 }}
          className="w-32 h-0.5 bg-amber-400/50 mx-auto"
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="space-y-2"
        >
          <p className="text-sm uppercase tracking-widest opacity-60">Dear Special Guest</p>
          <p className="text-3xl font-serif font-bold text-amber-100">{guest.name}</p>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-full text-white font-medium shadow-xl shadow-amber-900/30 transition-all"
        >
          Open Invitation
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const guestSlug = searchParams.get("guest");

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string>("pending");
  const [wishes, setWishes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Shuffle playlist on mount
  useEffect(() => {
    setPlaylist(shuffleArray(PLAYLIST));
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

  const handleSongEnd = () => {
    setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
  };

  // Auto-play next song
  useEffect(() => {
    if (audioRef.current && !isMuted && playlist.length > 0) {
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
    }
  }, [currentSongIndex, playlist]);

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
      <div className="h-screen w-full flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-12 h-12 text-amber-700 animate-spin" />
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
      {playlist.length > 0 && (
        <audio
          ref={audioRef}
          src={playlist[currentSongIndex]}
          onEnded={handleSongEnd}
          loop={playlist.length === 1}
        />
      )}

      {/* Music Toggle Button */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg transition-all hover:scale-110"
        aria-label={isMuted ? "Play music" : "Mute music"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
      </button>

      <main className="bg-[#faf8f5] text-[#3d3027]">
        {/* Background Pattern */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }}
        />

        {/* HERO SECTION */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 text-white max-w-4xl mx-auto space-y-6 md:space-y-8">
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl font-medium tracking-[0.2em] uppercase"
            >
              The Wedding of
            </motion.p>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-script text-5xl md:text-7xl lg:text-8xl text-amber-200 drop-shadow-lg"
            >
              Dimas & Davina
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7 }}
              className="w-24 h-1 bg-white/80 mx-auto rounded-full"
            />

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xl md:text-2xl font-serif italic"
            >
              Monday, 02 February 2025
            </motion.p>

            {guest && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-8 bg-white/10 backdrop-blur-md px-8 py-6 rounded-xl border border-white/20 inline-block"
              >
                <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Dear Special Guest</p>
                <p className="text-2xl md:text-3xl font-serif font-bold">{guest.name}</p>
              </motion.div>
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
        <section className="py-16 md:py-24 px-4 bg-amber-50/50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 text-center md:text-right space-y-6">
              <h2 className="text-4xl md:text-5xl font-script text-amber-700">Dimas Saktiawan</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                The son of Mr. Alan & Mrs. Alfatiha. <br />
                A man of few words but endless love. A dedicated developer and a loving partner who found his perfect match in the code of life.
              </p>
              <div className="flex justify-center md:justify-end gap-4 text-amber-600">
                <Camera className="w-6 h-6 opacity-60" />
                <Music className="w-6 h-6 opacity-60" />
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center md:justify-start">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full overflow-hidden border-8 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/dimas.jpg"
                  alt="The Groom - Dimas"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BRIDE SECTION */}
        <section className="py-16 md:py-24 px-4 bg-[#faf8f5]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full overflow-hidden border-8 border-white shadow-2xl -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/davina.jpeg"
                  alt="The Bride - Davina"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left space-y-6">
              <h2 className="text-4xl md:text-5xl font-script text-amber-700">Davina Anandia</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                The daughter of Mr. Zufar & Mrs. Intan. <br />
                A radiant soul with a heart of gold. She brings light, laughter, and warmth to everyone she meets.
              </p>
              <div className="flex justify-center md:justify-start gap-4 text-amber-600">
                <Heart className="w-6 h-6 opacity-60" />
                <Camera className="w-6 h-6 opacity-60" />
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE SECTION */}
        <section className="py-20 md:py-28 bg-amber-700 text-white text-center px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Heart className="w-12 h-12 mx-auto fill-current opacity-80" />
            <blockquote className="text-xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed">
              &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.&rdquo;
            </blockquote>
            <p className="text-lg opacity-80 font-medium tracking-wide">— Ar-Rum 30:21</p>
          </div>
        </section>

        {/* STORY SECTION */}
        <section className="py-16 md:py-24 px-4 bg-amber-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-amber-700 font-bold tracking-widest uppercase mb-2">Our Journey</p>
              <h2 className="text-4xl md:text-5xl font-serif">How We Met</h2>
            </div>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-300 -translate-x-1/2 hidden md:block" />

              {/* Story Items */}
              {[
                { year: "2023", title: "High School Days", text: "We were classmates in vocational school. Just friends sharing notes and dreams, unaware of what the future held." },
                { year: "2025", title: "Reconnected", text: "After a semester apart, a simple reply to an Instagram story sparked a conversation that never ended." },
                { year: "2026", title: "The Proposal", text: "Under the stars in Jakarta, he asked the question, and she said \"Yes\" to a lifetime together." },
              ].map((item, i) => (
                <div key={i} className={`relative grid md:grid-cols-2 gap-8 mb-12 items-center ${i % 2 === 1 ? "md:text-left" : "md:text-right"}`}>
                  {i % 2 === 0 ? (
                    <>
                      <div className="p-6 bg-white rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
                        <span className="text-amber-700 font-bold text-lg block mb-2">{item.year}</span>
                        <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.text}</p>
                      </div>
                      <div className="hidden md:flex justify-center">
                        <div className="w-4 h-4 bg-amber-600 rounded-full ring-4 ring-amber-200" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block" />
                      <div className="hidden md:flex justify-center">
                        <div className="w-4 h-4 bg-amber-600 rounded-full ring-4 ring-amber-200" />
                      </div>
                      <div className="p-6 bg-white rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow md:col-start-1 md:row-start-1">
                        <span className="text-amber-700 font-bold text-lg block mb-2">{item.year}</span>
                        <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.text}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EVENT DETAILS */}
        <section className="py-16 md:py-24 px-4 bg-[#faf8f5]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-amber-700 font-bold tracking-widest uppercase mb-2">The Details</p>
              <h2 className="text-4xl md:text-5xl font-serif">Save The Date</h2>
              <p className="text-gray-600 mt-4 text-lg">We can&apos;t wait to celebrate our special day with you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="bg-white p-3 rounded-full shadow-sm text-amber-700">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif mb-1">Holy Matrimony</h3>
                  <p className="text-gray-500 mb-2">Monday, 02 February 2025</p>
                  <p className="font-medium">08:00 AM - 10:00 AM</p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="bg-white p-3 rounded-full shadow-sm text-amber-700">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif mb-1">Wedding Reception</h3>
                  <p className="text-gray-500 mb-2">Monday, 02 February 2025</p>
                  <p className="font-medium">11:00 AM - 01:00 PM</p>
                </div>
              </div>

              <div className="md:col-span-2 flex items-start gap-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="bg-white p-3 rounded-full shadow-sm text-amber-700">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-serif mb-1">Location</h3>
                  <p className="text-gray-500 mb-2">Politeknik Prestasi Prima</p>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">
                    RW.5, Bambu Apus Kec. Cipayung Kota Jakarta Timur Daerah Khusus Ibukota Jakarta
                  </p>
                  <a
                    href="https://maps.google.com/?q=-6.32109656207519,106.90716737036655"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="mt-12 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-amber-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.4!2d106.907!3d-6.321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTknMTYuMCJTIDEwNsKwNTQnMjUuOCJF!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* RSVP SECTION */}
        {guest && (
          <section className="py-16 md:py-24 px-4 bg-amber-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-xl mx-auto text-center space-y-8">
              <div>
                <p className="text-amber-700 font-bold tracking-widest uppercase mb-2">RSVP</p>
                <h2 className="text-4xl md:text-5xl font-serif text-amber-800">Attendance</h2>
                <p className="text-gray-600 mt-4">Please let us know if you can join us in celebrating our love.</p>
              </div>

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("present")}
                    className={`px-6 py-3 rounded-full border-2 transition-all font-medium ${rsvpStatus === "present"
                        ? "bg-amber-700 text-white border-amber-700 shadow-lg"
                        : "border-amber-700 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    ✓ Will Attend
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("absent")}
                    className={`px-6 py-3 rounded-full border-2 transition-all font-medium ${rsvpStatus === "absent"
                        ? "bg-gray-700 text-white border-gray-700 shadow-lg"
                        : "border-gray-400 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    ✗ Cannot Attend
                  </button>
                </div>

                <textarea
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Send your wishes to the couple... 💕"
                  className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white"
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || rsvpStatus === "pending"}
                  className="px-10 py-4 bg-amber-700 hover:bg-amber-800 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20"
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
          </section>
        )}

        {/* FOOTER */}
        <footer className="bg-amber-800 text-white py-12 text-center">
          <h2 className="font-script text-4xl md:text-5xl mb-4">Dimas & Davina</h2>
          <p className="text-lg opacity-80 mb-6">02 . 02 . 2025</p>
          <Heart className="w-8 h-8 mx-auto fill-current opacity-60 mb-6" />
          <p className="text-xs opacity-50">
            Created with love for our special day<br />
            © 2025 All Rights Reserved
          </p>
        </footer>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-12 h-12 text-amber-700 animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
