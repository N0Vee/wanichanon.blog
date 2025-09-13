"use client";

import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatDate } from "@/app/utils/dateUtils";
import CodeBlock from "../../components/CodeBlock";

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
              {node.children?.map((child, idx) => renderNode(child, `${nodeId}-${idx}`))}
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
            node.children?.map((child, idx) => renderNode(child, `${nodeId}-${idx}`))
          );
        }

        case "code":
        case "codeblock": {
          const codeContent = node.text || getPlainText(node.children) || "";
          const language = node.language || "javascript";

          return (
            <div key={nodeId} className="mb-6">
              <CodeBlock language={language} code={codeContent} />
            </div>
          );
        }

        case "text": {
          let textElement = <span key={nodeId}>{node.text}</span>;

          if (node.format) {
            if (node.format & 1) // Bold
              textElement = <strong key={nodeId} className="font-semibold text-slate-200">{node.text}</strong>;
            else if (node.format & 2) // Italic
              textElement = <em key={nodeId} className="italic text-slate-300">{node.text}</em>;
            else if (node.format & 4) // Underline
              textElement = <u key={nodeId} className="underline decoration-amber-400/60">{node.text}</u>;
            else if (node.format & 8) // Strikethrough
              textElement = <s key={nodeId} className="line-through text-slate-400">{node.text}</s>;
            else if (node.format & 16) // Inline code
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
            node.children?.map((child, idx) => renderNode(child, `${nodeId}-${idx}`))
          );
        }

        case "listitem": {
          return (
            <li key={nodeId} className="text-lg text-slate-300 leading-relaxed mb-2 pl-2">
              <div className="inline-block">
                {node.children?.map((child, idx) => renderNode(child, `${nodeId}-${idx}`))}
              </div>
            </li>
          );
        }

        case "block": {
          // Handle Lexical blocks (including our custom CodeBlock)
          if (node.fields?.blockType === "codeBlock") {
            const codeContent = node.fields?.code || "";
            const language = node.fields?.language || "javascript";

            return (
              <div key={nodeId} className="mb-6">
                <CodeBlock language={language} code={codeContent} />
              </div>
            );
          }

          // For other block types, render children
          if (node.children && Array.isArray(node.children)) {
            return (
              <div key={nodeId} className="mb-6">
                {node.children.map((child, idx) => renderNode(child, `${nodeId}-${idx}`))}
              </div>
            );
          }

          return null;
        }

        default:
          // Handle unknown node types by rendering children
          if (node.children && Array.isArray(node.children)) {
            return (
              <div key={nodeId}>
                {node.children.map((child, idx) => renderNode(child, `${nodeId}-child-${idx}`))}
              </div>
            );
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

    const renderHeadingItem = (heading, isNested = false, nestingLevel = 0) => {
      const isActive = activeHeading === heading.id;
      const hasChildren = heading.children && heading.children.length > 0;
      const uniqueKey = `${heading.id}-${nestingLevel}`;

      return (
        <li key={uniqueKey} className={`${isNested ? 'ml-3' : ''}`}>
          <button
            onClick={() => scrollToHeading(heading.id)}
            className={`text-left w-full text-xs py-1.5 px-2 rounded-md transition-all duration-200 flex items-start space-x-2 group
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
            <span className="flex-1 leading-tight text-xs">{heading.text}</span>
            {isActive && (
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-amber-400 rounded-full mt-1" />
            )}
          </button>

          {hasChildren && (
            <ul className="mt-0.5 space-y-0.5 border-l border-slate-700/30 ml-3 pl-2">
              {heading.children.map((child, childIndex) =>
                renderHeadingItem(child, true, nestingLevel + 1 + childIndex)
              )}
            </ul>
          )}
        </li>
      );
    };

    return (
      <div
        className="lg:sticky lg:top-20"
      >
        <div className="glass-card p-4 rounded-lg border border-slate-700/30 max-h-[calc(100vh-6rem)] overflow-hidden">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <i className="fas fa-list-ul text-amber-400 text-xs" />
              <span>Contents</span>
            </h3>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-md transition-all duration-200"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              <i
                className={`fas fa-chevron-up text-xs transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'
              }`}
          >
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              <nav>
                <ul className="space-y-0.5">
                  {organizedHeadings.map((heading, index) => renderHeadingItem(heading, false, index))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Compact Footer */}
          {!isCollapsed && (
            <div className="mt-3 pt-3 border-t border-slate-700/30">
              <div className="text-xs text-slate-500 text-center">
                <span className="flex items-center justify-center space-x-1">
                  <i className="fas fa-bookmark" />
                  <span>{headings.length} sections</span>
                </span>
              </div>
            </div>
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
      </div>
    );
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Skeleton Hero Section */}
        <section className="relative py-12 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/8 rounded-full blur-3xl" />
            <div className="absolute top-10 -left-20 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

              {/* Content Column Skeleton */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="text-left space-y-4">
                  {/* Category & Meta Info Skeleton */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-6 bg-slate-600/50 rounded-full animate-pulse" />
                    <div className="w-16 h-4 bg-slate-600/40 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-slate-600/40 rounded animate-pulse" />
                  </div>

                  {/* Title Skeleton */}
                  <div className="space-y-3">
                    <div className="w-full h-12 bg-slate-600/60 rounded-lg animate-pulse" />
                    <div className="w-4/5 h-12 bg-slate-600/60 rounded-lg animate-pulse" />
                  </div>

                  {/* Excerpt Skeleton */}
                  <div className="space-y-2 mt-6">
                    <div className="w-full h-6 bg-slate-600/40 rounded animate-pulse" />
                    <div className="w-full h-6 bg-slate-600/40 rounded animate-pulse" />
                    <div className="w-3/4 h-6 bg-slate-600/40 rounded animate-pulse" />
                  </div>

                  {/* Author Info Skeleton */}
                  <div className="flex items-center space-x-2 mt-6">
                    <div className="w-4 h-4 bg-slate-600/40 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-slate-600/40 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Featured Image Skeleton */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="relative rounded-xl overflow-hidden glass-card border border-slate-700/30">
                  <div className="relative w-full h-48 bg-gradient-to-br from-slate-700/40 to-slate-600/40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-slate-600/40 rounded-lg flex items-center justify-center">
                        <i className="fas fa-image text-slate-500/60 text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton Content Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* TOC Skeleton */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="lg:sticky lg:top-20">
                  <div className="glass-card p-4 rounded-lg border border-slate-700/30">
                    {/* TOC Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500/60 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-slate-600/50 rounded animate-pulse" />
                      </div>
                      <div className="w-6 h-6 bg-slate-600/40 rounded animate-pulse" />
                    </div>

                    {/* TOC Items */}
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-600/40 rounded-full animate-pulse" />
                          <div className={`${index % 2 === 0 ? 'w-20' : 'w-16'} h-3 bg-slate-600/40 rounded animate-pulse`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="lg:col-span-4 order-1 lg:order-2">
                <div className="glass-card border border-slate-700/30 rounded-2xl p-6 md:p-8 lg:p-10">
                  {/* Content Skeleton */}
                  <div className="space-y-8">
                    {/* Loading Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full border border-emerald-500/30">
                        <i className="fas fa-file-alt text-emerald-400 text-sm" />
                        <span className="text-slate-300 text-sm font-medium">
                          Loading Article Content...
                        </span>
                      </div>
                    </div>

                    {/* Paragraph Skeletons */}
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="space-y-3">
                        {/* Heading or Paragraph */}
                        {index % 3 === 0 ? (
                          <div className="w-3/5 h-8 bg-slate-600/60 rounded animate-pulse" />
                        ) : (
                          <div className="space-y-2">
                            <div className="w-full h-5 bg-slate-600/40 rounded animate-pulse" />
                            <div className="w-full h-5 bg-slate-600/40 rounded animate-pulse" />
                            <div className="w-4/5 h-5 bg-slate-600/40 rounded animate-pulse" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Code Block Skeleton */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                      <div className="space-y-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={`${index === 0 ? 'w-1/3' : index === 1 ? 'w-2/3' : index === 2 ? 'w-full' : 'w-1/2'} h-4 bg-slate-600/40 rounded animate-pulse`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Loading Footer */}
                    <div className="text-center mt-8">
                      <div className="text-slate-400 text-sm flex items-center justify-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce" />
                        </div>
                        <span>Fetching article details...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton Back Button */}
        <section className="py-8 border-t border-slate-700/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="w-32 h-10 bg-slate-600/40 rounded-lg mx-auto animate-pulse" />
          </div>
        </section>
      </main>
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
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-full text-amber-400 font-medium transition-all duration-300 hover:scale-105"
            >
              Try Again
            </button>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-16 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Compact Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative py-12 overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/8 rounded-full blur-3xl" />
          <div className="absolute top-10 -left-20 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

            {/* Content Column - Fade in from left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 order-2 lg:order-1"
            >
              <div className="text-left">
                {/* Category & Meta Info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-center space-x-4 mb-4"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 glass-card border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium"
                  >
                    {post.category || 'Article'}
                  </motion.span>
                  <span className="text-slate-400 text-xs flex items-center space-x-2">
                    <i className="fas fa-clock" />
                    <span>{post.readTime || '5 min read'}</span>
                  </span>
                  <span className="text-slate-400 text-xs flex items-center space-x-2">
                    <i className="fas fa-calendar" />
                    <span>{post.date ? formatDate(post.date) : 'Today'}</span>
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-100 mb-4 leading-tight"
                >
                  {post.title}
                </motion.h1>

                {/* Excerpt */}
                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-lg text-slate-300 leading-relaxed mb-4"
                >
                  {post.excerpt || 'Welcome to this article.'}
                </motion.p>

                {/* Author Info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  className="flex items-center space-x-4 text-slate-400 text-sm"
                >
                  {author && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-user" />
                      <span>By {author.email || author.name || 'Wanichanon'}</span>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Compact Featured Image - Fade in from right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="lg:col-span-1 order-1 lg:order-2"
            >
              <div className="relative rounded-xl overflow-hidden glass-card border border-slate-700/30 shadow-xl">
                <Image
                  src={thumbnailUrl}
                  alt={post.title}
                  width={400}
                  height={240}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Content Section - Immediate Focus */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="py-8"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Table of Contents - Fade in from bottom */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="lg:col-span-1 order-2 lg:order-1"
            >
              <div className="lg:sticky lg:top-20">
                <TableOfContents headings={headings} />
              </div>
            </motion.div>

            {/* Main Content - Fade in from bottom with 0.2s delay */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="lg:col-span-4 order-1 lg:order-2"
            >
              <div className="glass-card border border-slate-700/30 rounded-2xl p-6 md:p-8 lg:p-10">
                {/* Article Content */}
                <div>
                  {post.details ? (
                    renderLexicalContent(post.details)
                  ) : (
                    <div className="space-y-6">
                      <p className="text-lg text-slate-300">
                        This article content is loading or unavailable.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Compact Back to Articles */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="py-8 border-t border-slate-700/30"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.0 }}
          >
            <motion.a
              href="/#articles"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center space-x-2 glass-card border border-amber-500/40 hover:border-amber-400/60 text-amber-400 hover:text-amber-300 px-6 py-3 rounded-lg font-medium transition-all duration-300 text-sm shadow-md hover:shadow-amber-500/20"
            >
              <i className="fas fa-arrow-left text-sm" />
              <span>Back to Articles</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </motion.main>
  );
}