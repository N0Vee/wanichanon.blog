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

  // Simple animations for first section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // fetch จาก cache route (aggregated short TTL)
        const res = await fetch('/api/cache/posts?featured=true', { cache: 'no-store', keepalive: true });
        let posts = [];

        if (res.ok) {
          const data = await res.json();
          posts = data.posts || [];
        }

        // ถ้ายังไม่เจอ featured posts → take first 3 posts
        const finalFeatured = posts.length > 0 ? posts : [];

        setFeaturedPosts(finalFeatured.slice(0, 3));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
  }, []);

  if (!mounted) return null;

  // Skeleton Loading Components
  const SkeletonCard = ({ isMain = false }) => (
    <div
      className={`glass-card rounded-2xl overflow-hidden border border-slate-700/30 ${isMain ? "lg:col-span-2" : ""
        }`}
    >
      {/* Image Skeleton */}
      <div className={`relative ${isMain ? "h-64 md:h-80" : "h-48"} bg-gradient-to-br from-slate-700/40 to-slate-600/40 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent animate-pulse" />
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
    </div>
  );

  const SideSkeletonCard = () => (
    <div className="glass-card rounded-xl p-6 border border-slate-700/30">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-16 h-16 bg-slate-600/40 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-500/30 to-transparent animate-pulse" />
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
    </div>
  );

  return (
    <section
      id="featured"
      className="relative py-20 bg-gradient-to-b from-slate-800 to-slate-700 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div>
          {/* Featured Posts Grid */}
          {isLoading ? (
            // Loading Skeleton
            <motion.div
              className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Featured Post Skeleton */}
              <SkeletonCard isMain={true} />

              {/* Side Posts Skeleton */}
              <div className="space-y-6">
                <SideSkeletonCard />
                <SideSkeletonCard />
              </div>
            </motion.div>
          ) : featuredPosts.length > 0 ? (
            <motion.div 
              className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Featured Post */}
              <motion.article
                variants={itemVariants}
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
                variants={itemVariants}
                className="space-y-6"
              >
                {featuredPosts.slice(0).map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="glass-card rounded-xl p-4 border border-slate-700/30 hover:border-emerald-500/40 hover:shadow-lg cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.3 }}
                  >
                    <Link href={`/post/${post.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                          <i className="fas fa-bookmark text-emerald-400" />
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
                            <button className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                              <i className="fas fa-chevron-right" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            // Empty State
            <div className="text-center py-20">
              <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
                <i className="fas fa-star text-4xl text-amber-400/60 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  No Featured Articles
                </h3>
                <p className="text-slate-500 text-sm">
                  Check back later for featured content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}