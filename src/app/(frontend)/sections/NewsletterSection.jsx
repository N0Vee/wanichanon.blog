"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ContactSection() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubscribed(true);
    setIsLoading(false);
    setEmail("");

    // Reset success message after 3 seconds
    setTimeout(() => setIsSubscribed(false), 30000);
  };

  if (!mounted) return null;

  return (
    <section
      id="contact"
      className="relative py-20 bg-gradient-to-b from-slate-600 to-slate-900 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-500/6 to-amber-500/6 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-amber-500/8 to-emerald-500/8 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 text-emerald-400/20 text-4xl"
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <i className="fas fa-envelope" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-16 text-amber-400/20 text-3xl"
          animate={{ y: [20, -20, 20], rotate: [0, -15, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <i className="fas fa-bell" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/4 text-emerald-400/15 text-2xl"
          animate={{ y: [-15, 25, -15], rotate: [0, 20, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          <i className="fas fa-newspaper" />
        </motion.div>
      </div>

      <div className="relative z-20 max-w-4xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div className="inline-flex items-center glass-card px-4 py-2 rounded-full mb-6 border border-emerald-500/20">
              <i className="fas fa-paper-plane text-emerald-400 mr-2" />
              <span className="text-slate-300 text-sm font-medium">
                Stay Updated
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-slate-100 mb-6"
            >
              Never Miss an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
                Article
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
            >
              Join our newsletter and get the latest articles, tutorials, and
              coding insights delivered straight to your inbox. No spam, just
              quality content.
            </motion.p>
          </motion.div>

          {/* Newsletter Form */}
          <motion.div variants={itemVariants} className="max-w-lg mx-auto">
            <div className="glass-card p-8 rounded-2xl border border-slate-600/30">
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-2xl text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    Successfully Subscribed!
                  </h3>
                  <p className="text-slate-400">
                    Thank you for joining our newsletter. You&apos;ll hear from
                    us soon!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <i className="fas fa-envelope" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/30 rounded-xl text-slate-100 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full relative overflow-hidden glass-card py-4 rounded-xl font-semibold text-slate-100 border border-slate-600 hover:border-amber-500 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <motion.i
                            className="fas fa-spinner"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe to Newsletter</span>
                          <i className="fas fa-arrow-right" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}