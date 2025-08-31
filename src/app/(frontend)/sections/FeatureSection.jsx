"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDate } from "@/app/utils";

export default function FeaturedSection() {
  const [mounted, setMounted] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState([]);
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
        staggerChildren: 0.2, // เพิ่มเวลาเพื่อให้ side posts เรียงขึ้นมาทีละอัน
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (index) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: index * 0.2, // ใช้ index เพื่อกำหนด delay ของแต่ละ post
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
        const res = await fetch(
          `${baseUrl}/api/posts?where[featured][equals]=true`
        );

        if (!res.ok) {
          console.error("Failed to fetch posts:", res.status);
          return;
        }

        const data = await res.json();
        // Filter for featured posts as backup (in case API filter doesn't work)
        const featured = data.docs.filter((post) => post.featured === true);

        // If no featured posts found, take first 3 posts as featured
        const finalFeatured =
          featured.length > 0 ? featured : data.docs.slice(0, 3);

        setFeaturedPosts(finalFeatured);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!mounted) return null;

  // Skeleton Loading Components
  const SkeletonCard = ({ isMain = false }) => (
    <motion.div
      className={`glass-card rounded-2xl overflow-hidden border border-slate-700/30 ${
        isMain ? "lg:col-span-2" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Skeleton */}
      <div className={`relative ${isMain ? "h-64 md:h-80" : "h-48"} bg-gradient-to-br from-slate-700/40 to-slate-600/40 overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <div className="absolute top-4 left-4">
          <div className="w-16 h-6 bg-slate-600/40 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-3 bg-slate-600/40 rounded animate-pulse" />
          <div className="w-1 h-1 bg-slate-600/40 rounded-full" />
          <div className="w-16 h-3 bg-slate-600/40 rounded animate-pulse" />
          <div className="w-1 h-1 bg-slate-600/40 rounded-full" />
          <div className="w-20 h-3 bg-slate-600/40 rounded animate-pulse" />
        </div>

        <div className="space-y-3 mb-4">
          <div className="w-full h-8 bg-slate-600/40 rounded animate-pulse" />
          <div className="w-4/5 h-8 bg-slate-600/40 rounded animate-pulse" />
          {isMain && <div className="w-3/4 h-8 bg-slate-600/40 rounded animate-pulse" />}
        </div>

        <div className="space-y-2 mb-6">
          <div className="w-full h-4 bg-slate-600/40 rounded animate-pulse" />
          <div className="w-full h-4 bg-slate-600/40 rounded animate-pulse" />
          <div className="w-2/3 h-4 bg-slate-600/40 rounded animate-pulse" />
        </div>

        <div className="w-24 h-6 bg-slate-600/40 rounded animate-pulse" />
      </div>
    </motion.div>
  );

  const SideSkeletonCard = () => (
    <motion.div
      className="glass-card rounded-xl p-6 border border-slate-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-16 h-16 bg-slate-600/40 rounded-lg overflow-hidden">
          <motion.div
            className="w-full h-full bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-3 bg-slate-600/40 rounded animate-pulse" />
            <div className="w-16 h-3 bg-slate-600/40 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-600/40 rounded animate-pulse" />
            <div className="w-4/5 h-4 bg-slate-600/40 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-600/40 rounded animate-pulse" />
            <div className="w-2/3 h-3 bg-slate-600/40 rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="w-16 h-3 bg-slate-600/40 rounded animate-pulse" />
            <div className="w-4 h-4 bg-slate-600/40 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section
      id="featured"
      className="relative py-20 bg-gradient-to-b from-slate-800 to-slate-700 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div>
          {/* Featured Posts Grid */}
          {isLoading ? (
            // Loading Skeleton
            <motion.div 
              className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Featured Post Skeleton */}
              <SkeletonCard isMain={true} />
              
              {/* Side Posts Skeleton */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <SideSkeletonCard />
                <SideSkeletonCard />
              </motion.div>
            </motion.div>
          ) : featuredPosts.length > 0 ? (
            <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Featured Post */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-2 group cursor-pointer"
              >
                <Link href={`/post/${featuredPosts[0].id}`}>
                  <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/30 hover:border-amber-500/40 transition-all duration-500">
                    {/* Image placeholder */}
                    <div className="relative h-64 md:h-80 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {featuredPosts[0]?.thumbnail ? (
                          <Image
                            src={featuredPosts[0].thumbnail.url}
                            alt={featuredPosts[0].title}
                            layout="fill"
                            objectFit="cover"
                          />
                        ) : (
                          <i className="fas fa-image" />
                        )}
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="glass px-3 py-1 rounded-full text-xs font-medium text-amber-300 border border-amber-500/30">
                          Featured
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-amber-400 text-sm font-medium">
                          {featuredPosts[0]?.category || "Tech"}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-sm">
                          {featuredPosts[0]?.readTime || "5 min read"}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-sm">
                          {formatDate(
                            featuredPosts[0]?.date || new Date().toISOString()
                          )}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4 group-hover:text-amber-300 transition-colors duration-300">
                        {featuredPosts[0]?.title || "Featured Article"}
                      </h3>

                      <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        {featuredPosts[0]?.excerpt ||
                          "This is a featured article excerpt..."}
                      </p>

                      <motion.button
                        className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 font-medium transition-colors duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <span>Read More</span>
                        <i className="fas fa-arrow-right" />
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.article>

              {/* Side Posts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-6"
              >
                {featuredPosts.slice(1).map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="glass-card rounded-xl p-6 border border-slate-700/30 hover:border-emerald-500/40 hover:shadow-lg cursor-pointer group"
                    whileHover={{ y: -4 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 10 }} // เพิ่ม delay ให้แต่ละ post ขึ้นมา
                  >
                    <Link href={`/post/${post.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                          <motion.i
                            className="fas fa-bookmark text-emerald-400"
                            whileHover={{ scale: 1.2 }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-emerald-400 text-xs font-medium">
                              {post.category}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors duration-300">
                            {post.title}
                          </h3>

                          <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-xs">
                              {formatDate(post.date)}
                            </span>
                            <motion.button
                              className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
                              whileHover={{ scale: 1.1 }}
                            >
                              <i className="fas fa-chevron-right" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            </div>
            ) : (
            // Empty State
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
                <i className="fas fa-star text-4xl text-amber-400/60 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  No Featured Articles
                </h3>
                <p className="text-slate-500 text-sm">
                  Check back later for featured content.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}