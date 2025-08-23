"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/4 to-emerald-500/4 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/3 to-amber-500/3 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="mb-6">
                <motion.h3 
                  className="text-2xl font-bold text-slate-100 mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-slate-300">Wanichanon.blog</span>
                </motion.h3>
                <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                  A passionate developer sharing knowledge about modern web development, 
                  programming best practices, and the latest technologies. Join me on this 
                  coding journey!
                </p>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { 
                    icon: "fab fa-github", 
                    href: "https://github.com", 
                    label: "GitHub",
                    color: "hover:text-slate-300" 
                  },
                  { 
                    icon: "fab fa-twitter", 
                    href: "https://twitter.com", 
                    label: "Twitter",
                    color: "hover:text-blue-400" 
                  },
                  { 
                    icon: "fab fa-linkedin", 
                    href: "https://linkedin.com", 
                    label: "LinkedIn",
                    color: "hover:text-blue-500" 
                  },
                  { 
                    icon: "fab fa-dev", 
                    href: "https://dev.to", 
                    label: "Dev.to",
                    color: "hover:text-slate-300" 
                  },
                  { 
                    icon: "fab fa-youtube", 
                    href: "https://youtube.com", 
                    label: "YouTube",
                    color: "hover:text-red-500" 
                  }
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 glass rounded-xl flex items-center justify-center text-slate-400 ${social.color} transition-all duration-300 border border-slate-700/30 hover:border-slate-500/40`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <i className={social.icon} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold text-slate-100 mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: "Home", id: "home" },
                  { label: "Featured", id: "featured" },
                  { label: "Articles", id: "articles" },
                  { label: "Newsletter", id: "newsletter" }
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <motion.i 
                        className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold text-slate-100 mb-6">Categories</h4>
              <ul className="space-y-3">
                {[
                  "Web Development",
                  "JavaScript",
                  "React & Next.js",
                  "TypeScript",
                  "CSS & Design",
                  "Node.js"
                ].map((category) => (
                  <li key={category}>
                    <a
                      href="#articles"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection("articles");
                      }}
                      className="text-slate-400 hover:text-amber-400 transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <motion.i 
                        className="fas fa-tag text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <span>{category}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Footer */}
          <motion.div 
            variants={itemVariants}
            className="border-t border-slate-800 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-500 text-sm mb-4 md:mb-0">
                <p>
                  © {new Date().getFullYear()} Wanichanon.blog. All rights reserved. 
                  Made with{" "}
                  <motion.span 
                    className="text-red-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ♥
                  </motion.span>{" "}
                  and Next.js
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <a 
                  href="#privacy" 
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                <a 
                  href="#terms" 
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-300"
                >
                  Terms of Service
                </a>
                
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating back to top button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 glass-card rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-400 shadow-xl border border-slate-700/30 hover:border-emerald-500/40 transition-all duration-300 z-50"
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        aria-label="Scroll to top"
      >
        <i className="fas fa-chevron-up" />
      </motion.button>
    </footer>
  );
}