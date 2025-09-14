"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDate, getAuthorName } from "@/app/utils";

export default function ArticleSection() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // ใช้ same origin API route
        const res = await fetch("/api/cache/posts");
        let posts = [];

        if (res.ok) {
          const data = await res.json();
          posts = data.posts; // ตาม JSON response จาก API
        } else {
          // Fallback: call main API silently
          const fallbackRes = await fetch("/api/posts?limit=20&sort=-date");
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            posts = fallbackData.docs;
          }
        }

        setArticles(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
  }, []);

  const categories = [
    "All",
    ...new Set(articles.map((article) => article.category)),
  ];

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  if (!mounted) return null;

  // Article Skeleton Loading Component
  const ArticleSkeletonCard = () => (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden border border-slate-600/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: "400px" }}
    >
      {/* Image Skeleton */}
      <div className="relative h-48 bg-gradient-to-br from-slate-700/40 to-slate-600/40 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <div className="absolute top-4 left-4">
          <div className="w-16 h-6 bg-slate-600/50 rounded-full">
            <motion.div
              className="w-full h-full bg-gradient-to-r from-amber-500/30 to-transparent rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-12 h-6 bg-slate-600/50 rounded-full">
            <motion.div
              className="w-full h-full bg-gradient-to-r from-emerald-500/30 to-transparent rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 bg-slate-600/40 rounded-lg flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <i className="fas fa-image text-slate-500/60" />
          </motion.div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Meta Info Skeleton */}
        <div className="flex items-center space-x-3">
          <motion.div
            className="flex items-center space-x-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-slate-600/50 rounded-full" />
            <div className="w-16 h-3 bg-slate-600/50 rounded" />
          </motion.div>
          <div className="w-1 h-1 bg-slate-600/50 rounded-full" />
          <motion.div
            className="flex items-center space-x-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >
            <div className="w-3 h-3 bg-slate-600/50 rounded-full" />
            <div className="w-12 h-3 bg-slate-600/50 rounded" />
          </motion.div>
          <div className="w-1 h-1 bg-slate-600/50 rounded-full" />
          <motion.div
            className="w-16 h-3 bg-slate-600/50 rounded"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <motion.div
            className="w-full h-6 bg-slate-600/50 rounded"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <motion.div
            className="w-4/5 h-6 bg-slate-600/50 rounded"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.1 }}
          />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2">
          <motion.div
            className="w-full h-4 bg-slate-600/40 rounded"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="w-full h-4 bg-slate-600/40 rounded"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="w-2/3 h-4 bg-slate-600/40 rounded"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-12 h-6 bg-slate-600/40 rounded"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1
              }}
            />
          ))}
        </div>

        {/* Button Skeleton */}
        <motion.div
          className="w-24 h-6 bg-slate-600/50 rounded"
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );

  return (
    <section
      id="articles"
      className="relative pt-10 pb-20 bg-gradient-to-b from-slate-700 to-slate-600 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-40 left-10 w-80 h-80 bg-gradient-to-r from-amber-500/8 to-emerald-500/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-72 h-72 bg-gradient-to-r from-emerald-500/8 to-amber-500/8 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div className="inline-flex items-center glass-card px-4 py-2 rounded-full mb-6 border border-emerald-500/20">
              <i className="fas fa-newspaper text-emerald-400 mr-2" />
              <span className="text-slate-300 text-sm font-medium">
                All Articles
              </span>
            </motion.div>

            {/* Category Filter */}
            {!isLoading && (
              <motion.div
                className="flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                      ? "glass-card border border-amber-500/40 text-amber-300 bg-amber-500/10"
                      : "glass border border-slate-600/30 text-slate-400 hover:text-slate-300 hover:border-slate-500/40"
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 + 0.5 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Articles Grid */}
          {isLoading ? (
            // Loading Skeleton
            <div className="space-y-8">
              {/* Loading Header */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full border border-emerald-500/30"
                  animate={{
                    scale: [1, 1.02, 1],
                    borderColor: ["rgba(16, 185, 129, 0.3)", "rgba(16, 185, 129, 0.6)", "rgba(16, 185, 129, 0.3)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.i
                    className="fas fa-spinner text-emerald-400 text-sm"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-slate-300 text-sm font-medium">
                    Loading Articles...
                  </span>
                </motion.div>
              </motion.div>

              {/* Skeleton Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1 + 0.3,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                  >
                    <ArticleSkeletonCard />
                  </motion.div>
                ))}
              </motion.div>

              {/* Loading Footer */}
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <motion.p
                  className="text-slate-400 text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Fetching the latest articles for you...
                </motion.p>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredArticles.map((article, index) => (
                  <motion.article
                    key={`${article.id}-${selectedCategory}`}
                    variants={itemVariants}
                    custom={index}
                    className="relative z-10 glass-card rounded-2xl overflow-hidden border border-slate-600/30 hover:border-emerald-500/40 hover:shadow-xl duration-100 cursor-pointer group"
                    whileHover={{ y: -4 }}
                    style={{ minHeight: "400px" }}
                    layout
                  >
                    <Link href={`/post/${article.id}`}>
                      {/* Article Image Placeholder */}
                      <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 overflow-hidden">
                        {article.thumbnail?.url ? (
                          <Image
                            src={article.thumbnail.url}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-4xl text-emerald-400/60">
                              <i className="fas fa-image" />
                            </div>
                          </div>
                        )}

                        {/* Featured badge */}
                        {article.featured && (
                          <div className="absolute top-4 left-4">
                            <span className="glass px-3 py-1 rounded-full text-xs font-medium text-amber-300 border border-amber-500/30">
                              Featured
                            </span>
                          </div>
                        )}

                        {/* Category badge */}
                        <div className="absolute top-4 right-4">
                          <span className="glass px-3 py-1 rounded-full text-xs font-medium text-emerald-300 border border-emerald-500/30">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-user" />
                            <span>{getAuthorName(article.author)}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-clock" />
                            <span>{article.readTime}</span>
                          </span>
                          <span>•</span>
                          <span>{formatDate(article.date)}</span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-100 mb-3 line-clamp-2 group-hover:text-emerald-300 transition-colors duration-300">
                          {article.title}
                        </h3>

                        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tagItem, index) => (
                            <span
                              key={`${article.id}-tag-${index}`}
                              className="px-2 py-1 rounded-md text-xs text-slate-400 bg-slate-800/50 border border-slate-700/30"
                            >
                              #{tagItem.tag || "tag"}
                            </span>
                          ))}
                        </div>

                        {/* Read More Button */}
                        <motion.button
                          className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors duration-300"
                          whileHover={{ x: 3 }}
                        >
                          <span>Read Article</span>
                          <i className="fas fa-arrow-right" />
                        </motion.button>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!isLoading && filteredArticles.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass p-8 rounded-2xl max-w-md mx-auto">
                <i className="fas fa-search text-4xl text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  No articles found
                </h3>
                <p className="text-slate-500 text-sm">
                  Try selecting a different category or check back later for new
                  content.
                </p>
              </div>
            </motion.div>
          )}

          {/* Load More Button */}
          <div className="text-center mt-12">
            <motion.button
              className="group relative overflow-hidden glass px-8 py-4 rounded-full font-semibold text-slate-100 border border-slate-600 hover:border-amber-500 transition-all duration-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center space-x-2">
                <span>Load More Articles</span>
                <motion.i
                  className="fas fa-plus"
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                />
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}