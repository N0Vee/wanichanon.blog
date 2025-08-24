"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function Navigation({ active }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(active || "home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const navItems = [
    { id: "featured", href: "#featured", label: "Featured", icon: "fas fa-star" },
    { id: "articles", href: "#articles", label: "Articles", icon: "fas fa-newspaper" },
    { id: "newsletter", href: "#newsletter", label: "Newsletter", icon: "fas fa-envelope" }
  ];

  const scrollToSection = useCallback((href) => {
    const element = document.getElementById(href.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);

          // Section detection logic
          const sections = navItems.map((item) => item.id);
          const scrollPosition = window.scrollY + 150; // Offset for better detection

          let currentSection = "home"; // Default to home

          for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element) {
              const rect = element.getBoundingClientRect();
              const elementTop = window.scrollY + rect.top;
              const elementBottom = elementTop + element.offsetHeight;

              // Check if we're in this section
              if (
                scrollPosition >= elementTop &&
                scrollPosition < elementBottom
              ) {
                currentSection = sectionId;
                break;
              }
            }
          }

          // Update active section only if it changed
          if (currentSection !== activeSection) {
            setActiveSection(currentSection);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection, navItems]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "backdrop-blur-xl bg-slate-900/30 border-slate-700/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center h-16 relative">
          {/* Logo - positioned absolutely to left */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-0 text-2xl font-bold"
          >
            <button
              onClick={() => scrollToSection("#home")}
              className="text-slate-100 hover:text-amber-400 transition-colors duration-300"
            >
              <span className="text-amber-500 font-semibold">Wanichanon.blog</span>
            </button>
          </motion.div>

          {/* Desktop Menu - centered */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out border-none ${
                  activeSection === item.id
                    ? "bg-amber-600/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </span>
              </motion.button>
            ))}
          </div>

          {/* Search Input - positioned absolutely to right */}
          <div className="absolute right-0 hidden md:flex items-center">
            <motion.div 
              className="relative"
              initial={{ width: 44 }}
              animate={{ width: isSearchFocused || searchQuery ? 320 : 44 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Search Input Container */}
              <div className="relative">
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <motion.i 
                    className={`fas fa-search text-sm transition-all duration-300 ${
                      isSearchFocused ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                    animate={{ 
                      rotate: isSearchFocused ? 12 : 0,
                      scale: isSearchFocused ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>

                {/* Search Input */}
                <motion.input
                  type="text"
                  placeholder={isSearchFocused || searchQuery ? "Search articles, topics..." : ""}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full h-11 pl-10 pr-12 glass-card border rounded-full text-slate-100 placeholder-slate-400 focus:outline-none transition-all duration-400 text-sm ${
                    isSearchFocused 
                      ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/20 bg-slate-800/70' 
                      : 'border-slate-600/40 hover:border-slate-500/60 bg-slate-800/20'
                  }`}
                  animate={{
                    backgroundColor: isSearchFocused || searchQuery 
                      ? 'rgba(30, 41, 59, 0.7)' 
                      : 'rgba(30, 41, 59, 0.2)'
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Search Actions */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {/* Clear Button */}
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery("")}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all duration-200"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="fas fa-times text-xs" />
                    </motion.button>
                  )}

                  {/* Search Button/Shortcut */}
                  <motion.div
                    className={`flex items-center transition-all duration-300 ${
                      isSearchFocused || searchQuery ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="glass px-2 py-1 rounded-md border border-slate-600/30">
                      <span className="text-xs text-slate-400 font-medium">⏎</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {(isSearchFocused || searchQuery) && (
                <motion.div
                  className="absolute top-12 left-0 right-0 glass-card border border-slate-600/40 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50 backdrop-blur-xl"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Search Header */}
                  <div className="px-4 py-3 border-b border-slate-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Quick Search</span>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <kbd className="px-2 py-1 glass rounded text-xs">ESC</kbd>
                        <span>to close</span>
                      </div>
                    </div>
                  </div>

                  {/* Search Content */}
                  <div className="p-4">
                    {searchQuery ? (
                      <div className="space-y-3">
                        <div className="text-center text-slate-400 py-6">
                          <div className="w-12 h-12 mx-auto mb-3 glass-card rounded-full flex items-center justify-center">
                            <i className="fas fa-search text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium mb-2">Search for &ldquo;{searchQuery}&rdquo;</p>
                          <p className="text-xs text-slate-500">
                            Advanced search functionality is coming soon!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Popular Searches */}
                        <div>
                          <h4 className="text-xs font-medium text-slate-300 mb-3">Popular Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {['React', 'Next.js', 'TypeScript', 'CSS'].map((topic) => (
                              <button
                                key={topic}
                                className="px-3 py-1 glass rounded-full text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 border border-slate-600/30 transition-all duration-200"
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-3 border-t border-slate-700/30">
                          <div className="flex items-center text-xs text-slate-500">
                            <i className="fas fa-lightbulb mr-2" />
                            <span>Try searching for articles, tutorials, or topics</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-amber-400 transition-colors duration-300"
          >
            <i
              className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden backdrop-blur-sm bg-slate-900/60 rounded-b-2xl border-b border-slate-700/30"
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-500 ease-out ${
                  activeSection === item.id
                    ? "bg-amber-600/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <span className="flex items-center space-x-3">
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </span>
              </button>
            ))}

            <div className="px-4 py-2 border-t border-slate-700/30 mt-4">
              <button
                onClick={() =>
                  window.open("/images/Wanichanon_SaeLee_Resume.pdf")
                }
                className="w-full backdrop-blur-sm bg-emerald-600/20 border border-emerald-500/40 hover:border-emerald-400/60 hover:bg-emerald-600/30 text-slate-100 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-500 ease-out"
              >
                <i className="fas fa-download" />
                <span>Resume</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}