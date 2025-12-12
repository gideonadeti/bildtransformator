"use client";

import { ChevronUp, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { useEffect, useState } from "react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t bg-muted/30 text-center">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-4">
          {/* Engineered by text */}
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Engineered by{" "}
            <span className="font-semibold text-foreground">Gideon Adeti</span>
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://github.com/gideonadeti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center justify-center hover:-translate-y-0.5 hover:scale-110 active:translate-y-0 active:scale-105"
              title="GitHub"
              aria-label="GitHub"
            >
              <Github className="size-5" />
            </a>
            <a
              href="https://linkedin.com/in/gideonadeti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center justify-center hover:-translate-y-0.5 hover:scale-110 active:translate-y-0 active:scale-105"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <Linkedin className="size-5" />
            </a>
            <a
              href="https://x.com/gideonadeti0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center justify-center hover:-translate-y-0.5 hover:scale-110 active:translate-y-0 active:scale-105"
              title="X (Twitter)"
              aria-label="X (Twitter)"
            >
              <Twitter className="size-5" />
            </a>
            <a
              href="mailto:gideonadeti0@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center justify-center hover:-translate-y-0.5 hover:scale-110 active:translate-y-0 active:scale-105"
              title="Email"
              aria-label="Email"
            >
              <Mail className="size-5" />
            </a>
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="mt-2 inline-flex items-center justify-center size-10 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-100 border border-border"
            title="Back to top"
            aria-label="Back to top"
            type="button"
          >
            <ChevronUp className="size-5" />
          </button>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground mt-2 mb-0">
            &copy; {currentYear ?? 2025} Bildtransformator. All Rights Reserved.
          </p>

          {/* Buy me coffee button */}
          <div className="mt-3">
            <a
              href="https://buymeacoffee.com/gideonadeti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all hover:scale-105 active:scale-100 text-sm font-medium"
              title="Support me with a coffee"
              aria-label="Buy me a coffee"
            >
              <span>☕</span>
              <span>Buy me a coffee</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
