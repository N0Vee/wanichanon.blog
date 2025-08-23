"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const floatingElements = [
    {
      icon: "fas fa-code",
      delay: 0,
      size: "text-2xl",
      color: "text-amber-400",
    },
    {
      icon: "fas fa-blog",
      delay: 2,
      size: "text-xl",
      color: "text-emerald-400",
    },
    {
      icon: "fas fa-lightbulb",
      delay: 4,
      size: "text-lg",
      color: "text-amber-300",
    },
    { icon: "fas fa-heart", delay: 1, size: "text-xl", color: "text-rose-400" },
    {
      icon: "fas fa-star",
      delay: 3,
      size: "text-sm",
      color: "text-yellow-400",
    },
  ];

  if (!mounted) return null;

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/15 to-amber-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Floating icons */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className={`absolute ${element.color} ${element.size}`}
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 6 + element.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay,
            }}
          >
            <i className={element.icon} />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center glass-card px-6 py-3 rounded-full mb-8 border border-amber-500/20"
        >
          <motion.div
            className="w-2 h-2 bg-emerald-400 rounded-full mr-3"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-slate-300 text-sm font-medium">
            Welcome to Wanichanon Blog
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="block text-slate-200 text-4xl md:text-5xl lg:text-6xl mt-2">
            Wanichanon.<span className="inline gradient-text">Blog</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Sharing thoughts, experiences, and insights about technology, coding,
          and life. Explore articles and stories from my journey.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={() => {
              const element = document.getElementById("featured");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative overflow-hidden glass-card px-8 py-4 rounded-full font-semibold text-slate-100 border border-amber-500/40 hover:border-amber-400/60 transition-all duration-500"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center space-x-2">
              <i className="fas fa-star" />
              <span>Featured Posts</span>
            </span>
          </motion.button>

          <motion.button
            onClick={() => {
              const element = document.getElementById("articles");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative overflow-hidden backdrop-blur-sm bg-slate-800/40 px-8 py-4 rounded-full font-semibold text-slate-300 border border-slate-600/40 hover:border-slate-500/60 hover:text-slate-100 transition-all duration-500"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center space-x-2">
              <i className="fas fa-book-open" />
              <span>Explore Articles</span>
            </span>
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 translate-y-50"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-slate-400 cursor-pointer"
            onClick={() => {
              const element = document.getElementById("featured");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1 h-3 bg-amber-400 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}