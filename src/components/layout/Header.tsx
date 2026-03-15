"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useScrollEngine } from "@/components/interactive/ScrollEngineContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const { scrollToOffset, subscribeToScroll } = useScrollEngine();
  const scrolledRef = useRef(false);

  // Scroll to top via engine
  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToOffset(0);
  }, [scrollToOffset]);

  // Sync dark mode state from DOM after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Track scroll position via engine for glass effect
  useEffect(() => {
    const unsubscribe = subscribeToScroll((offset) => {
      const isScrolled = offset > 50;
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    });
    return unsubscribe;
  }, [subscribeToScroll]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-gray-200/50 shadow-sm dark:border-gray-800/50"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Main navigation">
        {/* Logo */}
        <a href="#" onClick={handleLogoClick} className="flex items-center gap-2.5 min-h-[44px]">
          <Image src="/images/app-icon.png" alt="" width={28} height={28} className="rounded-md" aria-hidden="true" />
          <span className="text-lg font-semibold">Inertia</span>
        </a>

        {/* Nav */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/JayKayDude/Inertia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 min-h-[44px] flex items-center"
          >
            GitHub
          </a>
          <button
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px]"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
}
