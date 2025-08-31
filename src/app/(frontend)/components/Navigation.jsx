"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function Navigation({ active }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(active || "home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
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

  // Search functionality
  const searchPosts = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const results = await response.json();
      setSearchResults(results.posts || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search unavailable');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchPosts(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchPosts]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false);
        setSearchQuery("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPosts(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

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
              initial={{ width: 40 }}
              animate={{ width: isSearchFocused || searchQuery ? 300 : 40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Compact Search Button */}
              {!isSearchFocused && !searchQuery && (
                <motion.button
                  onClick={() => setIsSearchFocused(true)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 hover:border-emerald-500/50 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-search text-slate-400 text-sm" />
                </motion.button>
              )}

              {/* Expanded Search Input */}
              {(isSearchFocused || searchQuery) && (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <motion.input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => !searchQuery && setIsSearchFocused(false), 150)}
                      className="w-full h-12 pl-12 pr-12 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/70 focus:shadow-lg focus:shadow-emerald-500/25 transition-all duration-300 text-sm backdrop-blur-sm"
                      autoFocus
                    />
                    
                    {/* Search Icon */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <motion.i 
                        className="fas fa-search text-emerald-400 text-sm"
                        animate={{ rotate: isSearching ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {searchQuery && (
                        <motion.button
                          type="button"
                          onClick={clearSearch}
                          className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-red-500/20 border border-slate-600/30 hover:border-red-500/40 flex items-center justify-center transition-all duration-200"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <i className="fas fa-times text-xs text-slate-400 hover:text-red-400" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className={`w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          searchQuery.trim() 
                            ? 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-700/30 border-slate-600/30 text-slate-500 cursor-not-allowed'
                        }`}
                        whileHover={searchQuery.trim() ? { scale: 1.1 } : {}}
                        whileTap={searchQuery.trim() ? { scale: 0.9 } : {}}
                      >
                        {isSearching ? (
                          <i className="fas fa-spinner fa-spin text-xs" />
                        ) : (
                          <i className="fas fa-arrow-right text-xs" />
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Search Results Dropdown */}
              {(isSearchFocused || searchQuery) && (
                <motion.div
                  className="absolute top-16 right-0 w-80 bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-600/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 backdrop-blur-xl"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Search Header */}
                  <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-bolt text-emerald-400 text-sm" />
                        <span className="text-sm text-slate-200 font-medium">Quick Search</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <kbd className="px-2 py-1 bg-slate-700/60 border border-slate-600/40 rounded-lg text-xs text-slate-400">ESC</kbd>
                      </div>
                    </div>
                  </div>

                  {/* Search Content */}
                  <div className="p-5">
                    {searchQuery ? (
                      <div className="space-y-4">
                        {isSearching ? (
                          <div className="text-center py-8">
                            <motion.div 
                              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <i className="fas fa-search text-emerald-400 text-lg" />
                            </motion.div>
                            <p className="text-sm font-medium text-slate-200 mb-1">Searching...</p>
                            <p className="text-xs text-slate-400">Finding relevant articles</p>
                          </div>
                        ) : searchError ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
                              <i className="fas fa-exclamation-triangle text-red-400 text-lg" />
                            </div>
                            <p className="text-sm font-medium text-red-400 mb-1">Search Error</p>
                            <p className="text-xs text-slate-400">{searchError}</p>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs text-slate-400">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                              </p>
                              <div className="h-px bg-gradient-to-r from-emerald-500/20 to-transparent flex-1 ml-4" />
                            </div>
                            
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                              {searchResults.map((post) => (
                                <motion.a
                                  key={post.id}
                                  href={`/post/${post.id}`}
                                  className="block p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-slate-700/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10"
                                  whileHover={{ x: 4 }}
                                  onClick={() => {
                                    setIsSearchFocused(false);
                                    setSearchQuery("");
                                  }}
                                >
                                  <div className="flex items-start space-x-4">
                                    {post.thumbnail?.url && (
                                      <img 
                                        src={post.thumbnail.url} 
                                        alt={post.title}
                                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-600/30"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                                        {post.title}
                                      </h4>
                                      {post.excerpt && (
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                          {post.excerpt}
                                        </p>
                                      )}
                                      <div className="flex items-center space-x-3 text-xs">
                                        <span className="text-slate-500">
                                          {new Date(post.date || post.createdAt).toLocaleDateString()}
                                        </span>
                                        {post.category && (
                                          <>
                                            <div className="w-1 h-1 bg-slate-500 rounded-full" />
                                            <span className="text-amber-400 font-medium">{post.category}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <i className="fas fa-arrow-right text-slate-500 group-hover:text-emerald-400 transition-colors text-xs mt-1" />
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 border border-slate-600/40 rounded-2xl flex items-center justify-center">
                              <i className="fas fa-search text-slate-500 text-lg" />
                            </div>
                            <p className="text-sm font-medium text-slate-300 mb-1">No results found</p>
                            <p className="text-xs text-slate-400">Try different keywords or browse categories</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Popular Topics */}
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <i className="fas fa-fire text-orange-400 text-sm" />
                            <h4 className="text-sm font-medium text-slate-200">Trending Topics</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {['React', 'Next.js', 'TypeScript', 'CSS'].map((topic) => (
                              <motion.button
                                key={topic}
                                onClick={() => setSearchQuery(topic)}
                                className="p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-xl text-sm text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 text-left"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center space-x-2">
                                  <i className="fas fa-hashtag text-xs text-slate-500" />
                                  <span>{topic}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="pt-4 border-t border-slate-700/50">
                          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl">
                            <i className="fas fa-lightbulb text-blue-400 text-sm mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-300 font-medium mb-1">Pro Tip</p>
                              <p className="text-xs text-slate-400">Search by title, content, or category to find exactly what you need</p>
                            </div>
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