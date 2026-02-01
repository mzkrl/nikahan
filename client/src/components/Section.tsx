import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  parallax?: boolean;
}

export const Section = ({ children, className, id, parallax = false, ...props }: SectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    const content = contentRef.current;
    
    if (!el || !content) return;

    if (parallax) {
      gsap.fromTo(
        content,
        { y: 50, opacity: 0 },
        {
          y: -50,
          opacity: 1,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    } else {
      gsap.fromTo(
        content,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        }
      );
    }
  }, [parallax]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden py-24 px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      <div ref={contentRef} className="relative z-10 w-full max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
};
