import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useGuestBySlug } from "@/hooks/use-guests";
import { Section } from "@/components/Section";
import { WeddingMap } from "@/components/WeddingMap";
import { RSVPForm } from "@/components/RSVPForm";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { Calendar, Clock, MapPin, Heart, Music, Camera, Volume2, VolumeX } from "lucide-react";
import { Loader2 } from "lucide-react";
import gsap from "gsap";
import { AnimatePresence } from "framer-motion";


const PLAYLIST = [
  "/music/Lana Del Rey - Young and Beautiful.webm",
  "/music/Shane Filan - Beautiful In White.webm",
  "/music/Christina Perri - A Thousand Years.webm"
];

export default function Home() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const guestSlug = searchParams.get("guest");

  const { data: guest, isLoading } = useGuestBySlug(guestSlug);

  // State for welcome overlay - only show once per session for guests
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize random song on mount
  useEffect(() => {
    setCurrentSongIndex(Math.floor(Math.random() * PLAYLIST.length));
  }, []);

  useEffect(() => {
    // Check if we should show welcome overlay (only for guests, only once per session)
    if (guest && guestSlug) {
      const hasSeenWelcome = sessionStorage.getItem(`welcome-${guestSlug}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [guest, guestSlug]);

  useEffect(() => {
    // Reveal animation for hero text on load (only when welcome is not showing)
    if (!showWelcome) {
      gsap.fromTo(
        ".hero-text",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.5 }
      );
    }
  }, [showWelcome]);

  // Handle song ending to play next random song or sequential? 
  // "Randomizer" usually implies shuffling order or picking random next. 
  // Let's just pick a random next song different from current
  const handleSongEnd = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentSongIndex && PLAYLIST.length > 1);

    setCurrentSongIndex(nextIndex);
  };

  // Auto-play when index changes if not muted
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentSongIndex, isMuted]);

  const handleWelcomeComplete = () => {
    if (guestSlug) {
      sessionStorage.setItem(`welcome-${guestSlug}`, "true");
    }
    setShowWelcome(false);
    // Start music on welcome complete if not already playing/handled by overlay
    // Note: Overlay usually handles the initial interaction to unlock audio
    setIsMuted(false);
  };

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

  if (isLoading && guestSlug) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Welcome Overlay for guests */}
      <AnimatePresence>
        {showWelcome && guest && (
          <WelcomeOverlay guest={guest} onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>

      {/* Background Music */}
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={handleSongEnd} />

      {/* Music Toggle Button - fixed position */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary/90 hover:bg-primary text-white shadow-lg transition-all duration-300 hover:scale-110"
        aria-label={isMuted ? "Play music" : "Mute music"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </button>

      <div className="bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">

        {/* BACKGROUND ELEMENTS */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }}>
        </div>

        {/* HERO SECTION */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* Unsplash: Elegant wedding flowers background */}
            {/* Note: In a real app, use a compressed local asset or optimized cloud image */}
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 text-white max-w-4xl mx-auto space-y-8">
            <p className="hero-text text-lg md:text-xl font-medium tracking-[0.2em] uppercase">The Wedding of</p>

            <h1 className="hero-text font-script text-6xl md:text-8xl lg:text-9xl text-primary-foreground drop-shadow-lg">
              Dimas & Davina
            </h1>

            <div className="hero-text w-24 h-1 bg-white/80 mx-auto rounded-full" />

            <p className="hero-text text-xl md:text-2xl font-serif italic">
              Monday, 02 February 2025
            </p>

            {guest && (
              <div className="hero-text mt-12 bg-white/10 backdrop-blur-md px-8 py-6 rounded-xl border border-white/20 inline-block animate-in fade-in zoom-in duration-1000">
                <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Dear Special Guest</p>
                <p className="text-3xl font-serif font-bold">{guest.name}</p>
              </div>
            )}
          </div>

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
              <h2 className="text-5xl md:text-6xl font-script text-primary">Dimas Saktiawan</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The son of Mr. Alan & Mrs. Alfatiha. <br />
                A man of few words but endless love. A dedicated developer and a loving partner who found his perfect match in the code of life.
              </p>
              <div className="flex justify-center md:justify-end gap-4 text-primary">
                <Camera className="w-6 h-6 opacity-60" />
                <Music className="w-6 h-6 opacity-60" />
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center md:justify-start">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full overflow-hidden border-8 border-white shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                {/* Unsplash: Groom portrait placeholder */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60"
                  alt="The Groom"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* BRIDE SECTION */}
        <Section className="bg-background">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full overflow-hidden border-8 border-white shadow-2xl -rotate-3 transition-transform hover:rotate-0 duration-500">
                {/* Unsplash: Bride portrait placeholder */}
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60"
                  alt="The Bride"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left space-y-6">
              <h2 className="text-5xl md:text-6xl font-script text-primary">Davina Anandia</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The daughter of Mr. Zufar & Mrs. Intan. <br />
                A radiant soul with a heart of gold. She brings light, laughter, and warmth to everyone she meets.
              </p>
              <div className="flex justify-center md:justify-start gap-4 text-primary">
                <Heart className="w-6 h-6 opacity-60" />
                <Camera className="w-6 h-6 opacity-60" />
              </div>
            </div>
          </div>
        </Section>

        {/* QUOTE / DIVIDER */}
        <section className="py-24 bg-primary text-primary-foreground text-center px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Heart className="w-12 h-12 mx-auto fill-current opacity-80" />
            <blockquote className="text-2xl md:text-4xl font-serif italic leading-relaxed">
              "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy."
            </blockquote>
            <p className="text-lg opacity-80 font-medium tracking-wide">— Ar-Rum 30:21</p>
          </div>
        </section>

        {/* STORY SECTION */}
        <Section className="bg-secondary/30" parallax>
          <div className="text-center mb-16">
            <p className="text-primary font-bold tracking-widest uppercase mb-2">Our Journey</p>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">How We Met</h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30 -translate-x-1/2 hidden md:block"></div>

            {/* Story Item 1 */}
            <div className="relative grid md:grid-cols-2 gap-8 mb-12 items-center">
              <div className="md:text-right p-6 bg-white rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <span className="text-primary font-bold text-lg block mb-2">2023</span>
                <h3 className="text-xl font-serif font-bold mb-2">High School Days</h3>
                <p className="text-muted-foreground">
                  We were classmates in vocational school. Just friends sharing notes and dreams, unaware of what the future held.
                </p>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-primary/20"></div>
              </div>
              <div className="md:hidden order-last"></div>
            </div>

            {/* Story Item 2 */}
            <div className="relative grid md:grid-cols-2 gap-8 mb-12 items-center">
              <div className="hidden md:block"></div>
              <div className="hidden md:flex justify-center">
                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-primary/20"></div>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <span className="text-primary font-bold text-lg block mb-2">2025</span>
                <h3 className="text-xl font-serif font-bold mb-2">Reconnected</h3>
                <p className="text-muted-foreground">
                  After a semester apart, a simple reply to an Instagram story sparked a conversation that never ended.
                </p>
              </div>
            </div>

            {/* Story Item 3 */}
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div className="md:text-right p-6 bg-white rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <span className="text-primary font-bold text-lg block mb-2">2026</span>
                <h3 className="text-xl font-serif font-bold mb-2">The Proposal</h3>
                <p className="text-muted-foreground">
                  Under the stars in Jakarta, he asked the question, and she said "Yes" to a lifetime together.
                </p>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-primary/20"></div>
              </div>
              <div className="md:hidden order-last"></div>
            </div>
          </div>
        </Section>

        {/* EVENT DETAILS & LOCATION */}
        <Section className="bg-background">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-primary font-bold tracking-widest uppercase">The Details</p>
                <h2 className="text-4xl md:text-5xl font-serif">Save The Date</h2>
                <p className="text-muted-foreground text-lg">We can't wait to celebrate our special day with you.</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6 p-6 bg-secondary/30 rounded-2xl">
                  <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Holy Matrimony</h3>
                    <p className="text-muted-foreground mb-2">Monday, 02 February of 2026</p>
                    <p className="font-medium text-foreground">08:00 AM - 10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 bg-secondary/30 rounded-2xl">
                  <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Wedding Reception</h3>
                    <p className="text-muted-foreground mb-2">Monday, 02 February of 2026</p>
                    <p className="font-medium text-foreground">11:00 AM - 01:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 bg-secondary/30 rounded-2xl">
                  <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Location</h3>
                    <p className="text-muted-foreground mb-2">Politeknik Prestasi Prima</p>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                      RW.5, Bambu Apus Kec. Cipayung Kota Jakarta Timur Daerah Khusus Ibukota Jakarta
                    </p>
                    <a
                      href="https://maps.google.com/?q=-6.32109656207519,106.90716737036655"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-sm font-bold text-primary hover:underline"
                    >
                      Open in Google Maps &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full flex flex-col gap-8">
              <WeddingMap />
            </div>
          </div>
        </Section>

        {/* RSVP SECTION (Only if guest is present) */}
        {guest && (
          <Section className="bg-secondary/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif text-primary">Attendance</h2>
              <p className="text-muted-foreground">Please let us know if you can join us in celebrating our love.</p>
              <RSVPForm guest={guest} />
            </div>
          </Section>
        )}

        {/* FOOTER */}
        <footer className="bg-primary text-primary-foreground py-12 text-center">
          <h2 className="font-script text-4xl mb-4">Rizky & Davina</h2>
          <p className="text-sm opacity-80 mb-8">25 . 10 . 2025</p>
          <p className="text-xs opacity-60">
            Created with love for our Computer Science Practical Exam <br />
            &copy; 2025 All Rights Reserved
          </p>
        </footer>
      </div>
    </>
  );
}
