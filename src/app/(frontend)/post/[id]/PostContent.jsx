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

  const renderCodeWithHighlighting = (code, language) => {
    if (!code) return null;

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
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  };

  const renderLexicalContent = (content) => {
    if (!content || typeof content !== "object" || !("root" in content)) {
      return null;
    }

    const contentObj = content;
    if (!contentObj.root?.children) return null;

    const getPlainText = (nodes) => {
      if (!Array.isArray(nodes)) return "";
      return nodes
        .map((n) => {
          if (!n || typeof n !== "object") return "";
          const nn = n;
          if (nn.type === "linebreak") return "\n";
          if (typeof nn.text === "string") return nn.text;
          return getPlainText(nn.children);
        })
        .join("");
    };

    const renderNode = (node, index) => {
      if (!node || typeof node !== "object") return null;

      const nodeObj = node;
      const nodeId = nodeObj.id || `node-${index}`;

      switch (nodeObj.type) {
        case "paragraph": {
          const plain = getPlainText(nodeObj.children);
          const fenced = plain.match(/^```([A-Za-z0-9_+-]*)\n([\s\S]*?)\n```$/);
          if (fenced) {
            const lang = fenced[1] || "Code";
            const content = fenced[2] || "";
            return (
              <pre
                key={nodeId}
                className="mb-6 p-4 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-x-auto backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/30">
                  <span className="text-slate-400 text-xs font-medium flex items-center space-x-2">
                    <i className="fas fa-code" />
                    <span>{lang}</span>
                  </span>
                  <motion.button
                    onClick={() => navigator.clipboard.writeText(content)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-emerald-400 border border-slate-600/40 hover:border-emerald-500/40 rounded transition-all duration-200"
                  >
                    <i className="fas fa-copy mr-1" />
                    Copy
                  </motion.button>
                </div>
                <code className="text-slate-300 text-sm font-mono leading-relaxed block whitespace-pre">
                  {renderCodeWithHighlighting(content, lang)}
                </code>
              </pre>
            );
          }

          return (
            <p key={nodeId} className="mb-8 text-lg leading-8 text-slate-300">
              {nodeObj.children?.map((child, idx) => renderNode(child, idx))}
            </p>
          );
        }
        case "heading": {
          const headingLevel = nodeObj.tag || "h2";
          const text = getPlainText(nodeObj.children);
          const id =
            text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") || `heading-${index}`;

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
              className: `${
                headingClasses[headingLevel] || headingClasses.h2
              } scroll-mt-24 hover:text-amber-400 transition-colors duration-300`,
            },
            nodeObj.children?.map((child, idx) => renderNode(child, idx))
          );
        }
        case "linebreak":
          return <br key={nodeId} />;
        case "text": {
          let textElement = <span key={nodeId}>{nodeObj.text}</span>;
          if (nodeObj.format) {
            if (nodeObj.format & 1)
              textElement = (
                <strong
                  key={nodeId}
                  className="font-semibold text-slate-200"
                >
                  {nodeObj.text}
                </strong>
              );
            if (nodeObj.format & 2)
              textElement = (
                <em key={nodeId} className="italic text-slate-300">
                  {nodeObj.text}
                </em>
              );
            if (nodeObj.format & 4)
              textElement = (
                <u
                  key={nodeId}
                  className="underline decoration-amber-400/60"
                >
                  {nodeObj.text}
                </u>
              );
            if (nodeObj.format & 8)
              textElement = (
                <s key={nodeId} className="line-through text-slate-400">
                  {nodeObj.text}
                </s>
              );
            if (nodeObj.format & 16)
              textElement = (
                <code
                  key={nodeId}
                  className="px-2 py-1 bg-slate-800/60 border border-slate-700/50 rounded-md text-emerald-400 text-sm font-mono mx-1 shadow-sm"
                >
                  {nodeObj.text}
                </code>
              );
          }
          return textElement;
        }
        case "list": {
          const ListTag = nodeObj.listType === "number" ? "ol" : "ul";
          const listClasses =
            nodeObj.listType === "number"
              ? "mb-6 ml-0 space-y-3 counter-reset-list"
              : "mb-6 ml-0 space-y-3";

          return React.createElement(
            ListTag,
            {
              key: nodeId,
              className: listClasses,
              style:
                nodeObj.listType === "number" ? { counterReset: "list-counter" } : {},
            },
            nodeObj.children?.map((child, idx) => renderNode(child, idx))
          );
        }
        case "listitem":
          return (
            <li key={nodeId} className="text-lg flex items-start space-x-3 leading-relaxed">
              <span className="text-amber-400 font-bold text-xl leading-none mt-1 flex-shrink-0">
                •
              </span>
              <span className="flex-1">
                {nodeObj.children?.map((child, idx) => renderNode(child, idx))}
              </span>
            </li>
          );
        case "code": {
          const codeContent =
            nodeObj.children
              ?.map((child) => {
                const childObj = child;
                return childObj.text || "";
              })
              .join("") || nodeObj.text || "";

          return (
            <pre
              key={nodeId}
              className="mb-6 p-4 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-x-auto backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-xs font-medium flex items-center space-x-2">
                  <i className="fas fa-code" />
                  <span>JavaScript</span>
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
              <code className="text-slate-300 text-sm font-mono leading-relaxed block">
                {renderCodeWithHighlighting(codeContent, "javascript")}
              </code>
            </pre>
          );
        }
        case "codeblock": {
          const codeBlockContent =
            nodeObj.text ||
            nodeObj.children
              ?.map((child) => {
                const childObj = child;
                return childObj.text || "";
              })
              .join("") ||
            "";

          return (
            <pre
              key={nodeId}
              className="mb-6 p-4 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-x-auto backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-xs font-medium flex items-center space-x-2">
                  <i className="fas fa-code" />
                  <span>Code</span>
                </span>
                <motion.button
                  onClick={() =>
                    navigator.clipboard.writeText(codeBlockContent)
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-emerald-400 border border-slate-600/40 hover:border-emerald-500/40 rounded transition-all duration-200"
                >
                  <i className="fas fa-copy mr-1" />
                  Copy
                </motion.button>
              </div>
              <code className="text-slate-300 text-sm font-mono leading-relaxed block whitespace-pre">
                {renderCodeWithHighlighting(codeBlockContent, "code")}
              </code>
            </pre>
          );
        }
        case "inlineCode":
          return (
            <code
              key={nodeId}
              className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-emerald-400 text-sm font-mono"
            >
              {nodeObj.text}
            </code>
          );
        default:
          return (
            nodeObj.children?.map((child, idx) => renderNode(child, idx)) ||
            null
          );
      }
    };

    return contentObj.root.children.map((child, idx) => renderNode(child, idx));
  };

  // Table of Contents Component
  const TableOfContents = ({ headings }) => {
    if (headings.length === 0) return null;

    const scrollToHeading = (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    return (
      <div className="sticky top-24 glass-card p-6 rounded-xl border border-slate-700/30">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2">
          <i className="fas fa-list text-amber-400" />
          <span>Table of Contents</span>
        </h3>
        <nav>
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`text-left w-full text-sm hover:text-amber-400 transition-colors duration-200 ${
                    heading.level === 2 
                      ? 'text-slate-300' 
                      : heading.level === 3 
                        ? 'text-slate-400 ml-4' 
                        : 'text-slate-500 ml-8'
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card p-8 rounded-2xl">
            <i className="fas fa-spinner fa-spin text-4xl text-amber-400 mb-4" />
            <h2 className="text-xl font-medium text-slate-300 mb-2">
              Loading Article...
            </h2>
            <p className="text-slate-500">
              Please wait while we fetch the content.
            </p>
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
            <h2 className="text-xl font-medium text-slate-300 mb-2">
              Error Loading Article
            </h2>
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
            <h2 className="text-xl font-medium text-slate-300 mb-2">
              Article Not Found
            </h2>
            <p className="text-slate-500">
              The requested article could not be found.
            </p>
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
    const traverse = (children) => {
      children.forEach((node, index) => {
        if (node && typeof node === "object") {
          const nodeObj = node;
          if (nodeObj.type === "heading" && nodeObj.tag) {
            const getPlainText = (nodes) => {
              if (!Array.isArray(nodes)) return "";
              return nodes
                .map((n) => {
                  if (!n || typeof n !== "object") return "";
                  const nn = n;
                  if (nn.type === "linebreak") return "\n";
                  if (typeof nn.text === "string") return nn.text;
                  return getPlainText(nn.children);
                })
                .join("");
            };
            const text = getPlainText(nodeObj.children);
            const level = parseInt(nodeObj.tag.replace('h', '')) || 2;
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `heading-${index}`;
            headings.push({ id, text, level, tag: nodeObj.tag });
          }
          if (nodeObj.children) {
            traverse(nodeObj.children);
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
      <motion.section
        variants={itemVariants}
        className="relative py-20 overflow-hidden"
      >
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
                <motion.div
                  variants={itemVariants}
                  className="prose prose-invert prose-lg max-w-none"
                >
                  <div className="text-slate-300 leading-relaxed">
                    {post.details ? (
                      <div className="space-y-6">
                        {renderLexicalContent(post.details)}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-lg">
                          This article content is loading or unavailable.
                        </p>
                      </div>
                    )}
                  </div>
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