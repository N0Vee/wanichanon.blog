"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDate, getAuthorName } from "@/app/utils";

export default function ArticleSection() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState([]);
  const hasFetched = useRef(false);

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

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
        const res = await fetch(`${baseUrl}/api/posts`);

        if (!res.ok) {
          console.error("Failed to fetch posts:", res.status);
          return;
        }

        const data = await res.json();
        setArticles(data.docs);
      } catch (error) {
        console.error("Error fetching posts:", error);
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

  return (
    <section
      id="blogs"
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
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "glass-card border border-amber-500/40 text-amber-300 bg-amber-500/10"
                      : "glass border border-slate-600/30 text-slate-400 hover:text-slate-300 hover:border-slate-500/40"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <motion.article
                key={article.id}
                className="relative z-10 glass-card rounded-2xl overflow-hidden border border-slate-600/30 hover:border-emerald-500/40 hover:shadow-xl duration-100 cursor-pointer group"
                whileHover={{ y: -4 }}
                style={{ minHeight: "400px" }}
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
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
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