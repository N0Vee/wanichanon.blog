"use client";

import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Image from "next/image";
import { formatDate } from "@/app/utils/dateUtils";

export default function PostContent({ postId }) {
  const [mounted, setMounted] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const renderCodeWithHighlighting = (code, language = 'javascript') => {
    if (!code) return code;

    const languageMap = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      sh: "bash",
      shell: "bash",
      yml: "yaml",
      md: "markdown",
    };

    const detectedLanguage = language
      ? languageMap[language.toLowerCase()] || language.toLowerCase()
      : "javascript";

    return (
      <SyntaxHighlighter
        language={detectedLanguage}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        codeTagProps={{
          style: {
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  };

  const renderLexicalContent = (content) => {
    if (!content || typeof content !== "object" || !("root" in content)) {
      return <p className="text-slate-300">Content not available.</p>;
    }

    const contentObj = content;
    if (!contentObj.root?.children) {
      return <p className="text-slate-300">No content found.</p>;
    }

    const getPlainText = (nodes) => {
      if (!Array.isArray(nodes)) return "";
      return nodes
        .map((n) => {
          if (!n || typeof n !== "object") return "";
          if (n.type === "linebreak") return "\n";
          if (typeof n.text === "string") return n.text;
          if (n.children) return getPlainText(n.children);
          return "";
        })
        .join("");
    };

    // Shared function to create consistent heading IDs
    const createHeadingId = (text, index) => {
      const cleanText = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // Remove special characters
        .replace(/\s+/g, "-")        // Replace spaces with dashes
        .replace(/^-+|-+$/g, "")     // Remove leading/trailing dashes
        .substring(0, 50);           // Limit length
      
      return cleanText || `heading-${index}`;
    };

    // Process nodes to group code blocks
    const processNodes = (nodes) => {
      const processedNodes = [];
      let i = 0;
      
      while (i < nodes.length) {
        const node = nodes[i];
        if (node && node.type === "paragraph") {
          const textContent = getPlainText(node.children).trim();
          
          // Check if this is the start of a code block
          // Support various patterns: ```jsx, ```js, ```javascript, ```python, ```bash, etc.
          const codeStartMatch = textContent.match(/^```(\w*)$/);
          if (codeStartMatch) {
            const language = codeStartMatch[1] || 'text';
            const codeLines = [];
            let j = i + 1;
            let foundEnd = false;
            
            // Collect all code lines until we find the closing ```
            while (j < nodes.length) {
              const nextNode = nodes[j];
              if (nextNode && nextNode.type === "paragraph") {
                const nextText = getPlainText(nextNode.children).trim();
                
                // Check if this is the end of code block (just ```)
                if (nextText === "```") {
                  foundEnd = true;
                  break;
                }
                
                // Add this line to code content (preserve original formatting)
                const originalText = getPlainText(nextNode.children);
                codeLines.push(originalText);
              } else {
                // If we encounter a non-paragraph node, break the code block search
                break;
              }
              j++;
            }
            
            // Only create code block if we found both start and end
            if (foundEnd && codeLines.length > 0) {
              const codeContent = codeLines.join('\n');
              processedNodes.push({
                type: 'codeblock',
                id: node.id || `codeblock-${i}`,
                language: language,
                text: codeContent,
                originalNodes: nodes.slice(i, j + 1)
              });
              
              // Skip all the processed nodes (including the closing ```)
              i = j + 1;
              continue;
            } else if (foundEnd) {
              // Empty code block - still skip the ``` markers
              i = j + 1;
              continue;
            }
          }
        }
        
        // Regular node, add as-is
        processedNodes.push(node);
        i++;
      }
      
      return processedNodes;
    };

    const renderNode = (node, index) => {
      if (!node || typeof node !== "object") return null;

      const nodeId = node.id || `node-${index}`;

      switch (node.type) {
        case "paragraph": {
          const textContent = getPlainText(node.children).trim();
          
          // Skip if this looks like a code fence marker (should be handled by processNodes)
          if (textContent.match(/^```\w*$/) || textContent === "```") {
            return null;
          }

          // Regular paragraph
          return (
            <p key={nodeId} className="mb-6 text-lg leading-8 text-slate-300">
              {node.children?.map((child, idx) => renderNode(child, idx))}
            </p>
          );
        }

        case "heading": {
          const headingLevel = node.tag || "h2";
          const text = getPlainText(node.children);
          const id = createHeadingId(text, index);

          const headingClasses = {
            h1: "text-4xl font-bold text-slate-100 mb-8 mt-12 first:mt-0",
            h2: "text-3xl font-bold text-slate-100 mb-6 mt-10 first:mt-0",
            h3: "text-2xl font-semibold text-slate-200 mb-4 mt-8 first:mt-0",
            h4: "text-xl font-semibold text-slate-200 mb-4 mt-6 first:mt-0",
            h5: "text-lg font-medium text-slate-300 mb-3 mt-4 first:mt-0",
            h6: "text-base font-medium text-slate-300 mb-3 mt-4 first:mt-0",
          };

          return React.createElement(
            headingLevel,
            {
              key: nodeId,
              id: id,
              className: `${headingClasses[headingLevel] || headingClasses.h2} scroll-mt-24 hover:text-amber-400 transition-colors duration-300`,
            },
            node.children?.map((child, idx) => renderNode(child, idx))
          );
        }

        case "code":
        case "codeblock": {
          const codeContent = node.text || getPlainText(node.children) || "";
          const language = node.language || "javascript";

          return (
            <div key={nodeId} className="mb-6">
              <div className="bg-slate-900/90 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/30">
                  <span className="text-slate-400 text-sm font-medium flex items-center space-x-2">
                    <i className="fas fa-code" />
                    <span>{language}</span>
                  </span>
                  <motion.button
                    onClick={() => navigator.clipboard.writeText(codeContent)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-emerald-400 border border-slate-600/40 hover:border-emerald-500/40 rounded transition-all duration-200"
                  >
                    <i className="fas fa-copy mr-1" />
                    Copy
                  </motion.button>
                </div>
                <div className="p-0">
                  {renderCodeWithHighlighting(codeContent, language)}
                </div>
              </div>
            </div>
          );
        }

        case "text": {
          let textElement = <span key={nodeId}>{node.text}</span>;
          
          if (node.format) {
            if (node.format & 1) // Bold
              textElement = <strong key={nodeId} className="font-semibold text-slate-200">{node.text}</strong>;
            if (node.format & 2) // Italic
              textElement = <em key={nodeId} className="italic text-slate-300">{node.text}</em>;
            if (node.format & 4) // Underline
              textElement = <u key={nodeId} className="underline decoration-amber-400/60">{node.text}</u>;
            if (node.format & 8) // Strikethrough
              textElement = <s key={nodeId} className="line-through text-slate-400">{node.text}</s>;
            if (node.format & 16) // Inline code
              textElement = (
                <code key={nodeId} className="px-2 py-1 bg-slate-800/60 border border-slate-700/50 rounded-md text-emerald-400 text-sm font-mono mx-1">
                  {node.text}
                </code>
              );
          }
          
          return textElement;
        }

        case "linebreak":
          return <br key={nodeId} />;

        case "list": {
          const ListTag = node.listType === "number" || node.tag === "ol" ? "ol" : "ul";
          const baseClasses = "mb-6 space-y-2 text-slate-300";
          const listTypeClasses = ListTag === "ol" 
            ? "list-decimal list-inside pl-6" 
            : "list-disc list-inside pl-6";

          return React.createElement(
            ListTag,
            {
              key: nodeId,
              className: `${baseClasses} ${listTypeClasses}`,
            },
            node.children?.map((child, idx) => renderNode(child, idx))
          );
        }

        case "listitem": {
          return (
            <li key={nodeId} className="text-lg text-slate-300 leading-relaxed mb-2 pl-2">
              <div className="inline-block">
                {node.children?.map((child, idx) => renderNode(child, idx))}
              </div>
            </li>
          );
        }

        default:
          // Handle unknown node types by rendering children
          if (node.children && Array.isArray(node.children)) {
            return node.children.map((child, idx) => renderNode(child, idx));
          }
          return null;
      }
    };

    return (
      <div className="prose prose-invert prose-lg max-w-none">
        {processNodes(contentObj.root.children).map((child, idx) => renderNode(child, idx))}
      </div>
    );
  };

  // Table of Contents Component
  const TableOfContents = ({ headings }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeHeading, setActiveHeading] = useState("");

    // Group headings by levels for better structure
    const organizeHeadings = (headings) => {
      const organized = [];
      const stack = [];

      headings.forEach((heading) => {
        const item = { ...heading, children: [] };

        // Find the appropriate parent
        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
          stack.pop();
        }

        if (stack.length === 0) {
          organized.push(item);
        } else {
          stack[stack.length - 1].children.push(item);
        }

        stack.push(item);
      });

      return organized;
    };

    const organizedHeadings = organizeHeadings(headings);

    // Monitor scroll to highlight active heading
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHeading(entry.target.id);
            }
          });
        },
        { rootMargin: '-100px 0px -50% 0px' }
      );

      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });

      return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    const scrollToHeading = (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const renderHeadingItem = (heading, isNested = false) => {
      const isActive = activeHeading === heading.id;
      const hasChildren = heading.children && heading.children.length > 0;

      return (
        <li key={heading.id} className={`${isNested ? 'ml-4' : ''}`}>
          <button
            onClick={() => scrollToHeading(heading.id)}
            className={`text-left w-full text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-start space-x-2 group
              ${isActive 
                ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-400' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }
              ${heading.level === 2 ? 'font-medium' : heading.level === 3 ? 'font-normal' : 'font-light text-xs'}
            `}
          >
            <span className={`flex-shrink-0 mt-0.5 text-xs opacity-60 group-hover:opacity-80 ${isActive ? 'opacity-100' : ''}`}>
              {heading.level === 2 ? '▪' : heading.level === 3 ? '▸' : '·'}
            </span>
            <span className="flex-1 leading-relaxed">{heading.text}</span>
            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-1"
              />
            )}
          </button>
          
          {hasChildren && (
            <ul className="mt-1 space-y-1 border-l border-slate-700/30 ml-5 pl-2">
              {heading.children.map((child) => renderHeadingItem(child, true))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-24"
      >
        <div className="glass-card p-6 rounded-xl border border-slate-700/30 max-h-[calc(100vh-8rem)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
              <i className="fas fa-list-ul text-amber-400" />
              <span>Table of Contents</span>
            </h3>
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              <motion.i
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="fas fa-chevron-up text-sm"
              />
            </motion.button>
          </div>

          {/* Content */}
          <motion.div
            initial={false}
            animate={{
              height: isCollapsed ? 0 : "auto",
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <nav>
                <ul className="space-y-1">
                  {organizedHeadings.map((heading) => renderHeadingItem(heading))}
                </ul>
              </nav>
            </div>
          </motion.div>

          {/* Footer info */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 pt-4 border-t border-slate-700/30"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <i className="fas fa-bookmark" />
                  <span>{headings.length} sections</span>
                </span>
                <span className="flex items-center space-x-1">
                  <i className="fas fa-eye" />
                  <span>Auto-scroll</span>
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgb(148 163 184 / 0.3) transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(148 163 184 / 0.3);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(148 163 184 / 0.5);
          }
        `}</style>
      </motion.div>
    );
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card p-8 rounded-2xl">
            <i className="fas fa-spinner fa-spin text-4xl text-amber-400 mb-4" />
            <h2 className="text-xl font-medium text-slate-300 mb-2">Loading Article...</h2>
            <p className="text-slate-500">Please wait while we fetch the content.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card p-8 rounded-2xl max-w-md">
            <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4" />
            <h2 className="text-xl font-medium text-slate-300 mb-2">Error Loading Article</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-full text-amber-400 font-medium transition-all duration-300"
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card p-8 rounded-2xl">
            <i className="fas fa-file-alt text-4xl text-slate-400 mb-4" />
            <h2 className="text-xl font-medium text-slate-300 mb-2">Article Not Found</h2>
            <p className="text-slate-500">The requested article could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const thumbnail = post.thumbnail;
  const author = post.author;
  const thumbnailUrl = thumbnail?.url || "/api/media/default-post-thumbnail.jpg";

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

  // Extract headings for TOC
  const extractHeadings = (nodes) => {
    const headings = [];
    let headingIndex = 0;
    
    const traverse = (children) => {
      children.forEach((node) => {
        if (node && typeof node === "object") {
          if (node.type === "heading" && node.tag) {
            const getPlainText = (nodes) => {
              if (!Array.isArray(nodes)) return "";
              return nodes
                .map((n) => {
                  if (!n || typeof n !== "object") return "";
                  if (n.type === "linebreak") return "\n";
                  if (typeof n.text === "string") return n.text;
                  if (n.children) return getPlainText(n.children);
                  return "";
                })
                .join("");
            };
            
            // Create heading ID using the same function as renderNode
            const createHeadingId = (text, index) => {
              const cleanText = text
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "") // Remove special characters
                .replace(/\s+/g, "-")        // Replace spaces with dashes
                .replace(/^-+|-+$/g, "")     // Remove leading/trailing dashes
                .substring(0, 50);           // Limit length
              
              return cleanText || `heading-${index}`;
            };
            
            const text = getPlainText(node.children);
            const level = parseInt(node.tag.replace('h', '')) || 2;
            const id = createHeadingId(text, headingIndex);
            
            headings.push({ id, text, level, tag: node.tag });
            headingIndex++;
          }
          if (node.children) {
            traverse(node.children);
          }
        }
      });
    };
    traverse(nodes);
    return headings;
  };

  const headings = post.details && post.details.root?.children 
    ? extractHeadings(post.details.root.children) 
    : [];

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pt-20 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div variants={itemVariants} className="text-center mb-12">
            {/* Category & Read Time */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 glass-card border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium"
              >
                {post.category || 'Article'}
              </motion.span>
              <span className="text-slate-400 text-sm flex items-center space-x-2">
                <i className="fas fa-clock" />
                <span>{post.readTime || '5 min read'}</span>
              </span>
            </div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 leading-tight"
            >
              {post.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              {post.excerpt || 'Welcome to this article.'}
            </motion.p>

            {/* Meta Info */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center space-x-6 text-slate-400 text-sm"
            >
              {author && (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-user" />
                  <span>By {author.email || author.name || 'Wanichanon'}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <i className="fas fa-calendar" />
                <span>{post.date ? formatDate(post.date) : 'Today'}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-2xl overflow-hidden glass-card border border-slate-700/30 shadow-2xl"
          >
            <Image
              src={thumbnailUrl}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
          </motion.div>
        </div>
      </motion.section>

      {/* Content Section */}
      <motion.section variants={itemVariants} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Left Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <TableOfContents headings={headings} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <motion.div
                variants={itemVariants}
                className="glass-card border border-slate-700/30 rounded-2xl p-8 md:p-12"
              >
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <motion.div variants={itemVariants} className="mb-12">
                    <h3 className="text-lg font-medium text-slate-300 mb-4 flex items-center space-x-2">
                      <i className="fas fa-tags text-emerald-400" />
                      <span>Tags</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {post.tags.map((tagItem, index) => (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 glass rounded-full text-sm text-slate-300 border border-slate-600/40 hover:border-emerald-500/40 transition-all duration-300 font-medium"
                        >
                          #{tagItem.tag || tagItem}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Article Content */}
                <motion.div variants={itemVariants}>
                  {post.details ? (
                    renderLexicalContent(post.details)
                  ) : (
                    <div className="space-y-6">
                      <p className="text-lg text-slate-300">
                        This article content is loading or unavailable.
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Share Section */}
                <motion.div
                  variants={itemVariants}
                  className="mt-16 pt-8 border-t border-slate-700/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-200 mb-2">
                        Enjoyed this article?
                      </h3>
                      <p className="text-slate-400">
                        Share it with others who might find it useful.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {[
                        { platform: 'twitter', icon: 'fab fa-twitter', color: 'hover:text-blue-400 hover:border-blue-500/40' },
                        { platform: 'linkedin', icon: 'fab fa-linkedin-in', color: 'hover:text-blue-600 hover:border-blue-600/40' },
                        { platform: 'facebook', icon: 'fab fa-facebook-f', color: 'hover:text-blue-500 hover:border-blue-500/40' }
                      ].map(({ platform, icon, color }) => (
                        <motion.button
                          key={platform}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 glass-card border border-slate-600/40 rounded-full flex items-center justify-center text-slate-400 transition-all duration-300 ${color}`}
                        >
                          <i className={icon} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Back to Articles */}
      <motion.section variants={itemVariants} className="pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.a
              href="/#articles"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 glass-card border border-amber-500/40 hover:border-amber-400/60 text-amber-400 hover:text-amber-300 px-8 py-4 rounded-full font-semibold transition-all duration-300 text-lg shadow-lg hover:shadow-amber-500/20"
            >
              <i className="fas fa-arrow-left text-lg" />
              <span>Back to Articles</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </motion.main>
  );
}