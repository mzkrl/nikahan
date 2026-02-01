"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, Calendar, Clock, MapPin, Volume2, VolumeX, Loader2 } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  slug: string;
  attendanceStatus: string;
  wishes?: string;
}

const PLAYLIST = [
  "/music/Lana Del Rey - Young and Beautiful.webm",
  "/music/Shane Filan - Beautiful In White.webm",
  "/music/Christina Perri - A Thousand Years.webm"
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const guestSlug = searchParams.get("guest");

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string>("");
  const [wishes, setWishes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch guest data
  useEffect(() => {
    if (guestSlug) {
      setIsLoading(true);
      fetch(`/api/guests/slug/${guestSlug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setGuest(data);
          if (data) {
            setShowWelcome(true);
            setRsvpStatus(data.attendanceStatus || "pending");
            setWishes(data.wishes || "");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [guestSlug]);

  // Random song on mount
  useEffect(() => {
    setCurrentSongIndex(Math.floor(Math.random() * PLAYLIST.length));
  }, []);

  const handleSongEnd = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } while (nextIndex === currentSongIndex && PLAYLIST.length > 1);
    setCurrentSongIndex(nextIndex);
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

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setIsSubmitting(true);
    try {
      await fetch(`/api/guests/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceStatus: rsvpStatus, wishes }),
      });
      alert("Thank you for your response!");
    } catch (error) {
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Welcome Overlay */}
      {showWelcome && guest && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
          <div className="text-center text-white space-y-8 p-8">
            <p className="text-lg tracking-widest uppercase opacity-80">You are invited</p>
            <h1 className="text-5xl md:text-7xl font-script text-amber-200">
              Dimas & Davina
            </h1>
            <p className="text-2xl">Dear {guest.name}</p>
            <button
              onClick={handleWelcomeComplete}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-full text-white font-medium transition-all"
            >
              Open Invitation
            </button>
          </div>
        </div>
      )}

      {/* Background Music */}
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={handleSongEnd} />

      {/* Music Toggle */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-all"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <main className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
              alt="Wedding Flowers"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 text-white max-w-4xl mx-auto space-y-8">
            <p className="text-lg md:text-xl font-medium tracking-[0.2em] uppercase">The Wedding of</p>
            <h1 className="font-script text-6xl md:text-8xl lg:text-9xl text-amber-200 drop-shadow-lg">
              Dimas & Davina
            </h1>
            <div className="w-24 h-1 bg-white/80 mx-auto rounded-full" />
            <p className="text-xl md:text-2xl italic">Monday, 02 February 2025</p>

            {guest && (
              <div className="mt-12 bg-white/10 backdrop-blur-md px-8 py-6 rounded-xl border border-white/20 inline-block">
                <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Dear Special Guest</p>
                <p className="text-3xl font-bold">{guest.name}</p>
              </div>
            )}
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-24 bg-amber-700 text-white text-center px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Heart className="w-12 h-12 mx-auto fill-current opacity-80" />
            <blockquote className="text-2xl md:text-4xl italic leading-relaxed">
              &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them.&rdquo;
            </blockquote>
            <p className="text-lg opacity-80 font-medium">— Ar-Rum 30:21</p>
          </div>
        </section>

        {/* Event Details */}
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-700 font-bold tracking-widest uppercase mb-2">The Details</p>
            <h2 className="text-4xl md:text-5xl">Save The Date</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-6 p-6 bg-amber-50 rounded-2xl">
              <div className="bg-white p-3 rounded-full shadow-sm text-amber-700">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Holy Matrimony</h3>
                <p className="text-muted-foreground mb-2">Monday, 02 February 2025</p>
                <p className="font-medium">08:00 AM - 10:00 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 bg-amber-50 rounded-2xl">
              <div className="bg-white p-3 rounded-full shadow-sm text-amber-700">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Wedding Reception</h3>
                <p className="text-muted-foreground mb-2">Monday, 02 February 2025</p>
                <p className="font-medium">11:00 AM - 01:00 PM</p>
              </div>
            </div>

            <div className="md:col-span-2 flex items-start gap-6 p-6 bg-amber-50 rounded-2xl">
              <div className="bg-white p-3 rounded-full shadow-sm text-amber-700">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Location</h3>
                <p className="text-muted-foreground mb-2">Politeknik Prestasi Prima</p>
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-3">
                  RW.5, Bambu Apus Kec. Cipayung Kota Jakarta Timur
                </p>
                <a
                  href="https://maps.google.com/?q=-6.32109656207519,106.90716737036655"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-amber-700 hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP Section */}
        {guest && (
          <section className="py-24 px-4 bg-amber-50">
            <div className="max-w-xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl text-amber-700">Attendance</h2>
              <p className="text-muted-foreground">Please let us know if you can join us</p>

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("present")}
                    className={`px-6 py-3 rounded-full border-2 transition-all ${rsvpStatus === "present"
                        ? "bg-amber-700 text-white border-amber-700"
                        : "border-amber-700 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    Will Attend
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("absent")}
                    className={`px-6 py-3 rounded-full border-2 transition-all ${rsvpStatus === "absent"
                        ? "bg-gray-700 text-white border-gray-700"
                        : "border-gray-500 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Cannot Attend
                  </button>
                </div>

                <textarea
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Send your wishes to the couple..."
                  className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || rsvpStatus === "pending"}
                  className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Send Response"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-amber-700 text-white py-12 text-center">
          <h2 className="font-script text-4xl mb-4">Dimas & Davina</h2>
          <p className="text-sm opacity-80 mb-8">02 . 02 . 2025</p>
          <p className="text-xs opacity-60">
            Created with love • © 2025 All Rights Reserved
          </p>
        </footer>
      </main>
    </>
  );
}
