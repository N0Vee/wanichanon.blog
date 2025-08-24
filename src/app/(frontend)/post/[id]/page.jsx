import { getPayload } from "payload";
import React from "react";
import { fileURLToPath } from "url";

import config from "@/payload.config";

import "../../styles.css";
import Navigation from "@/app/(frontend)/components/Navigation";
import Footer from "@/app/(frontend)/components/Footer";
import PostContent from "./PostContent";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const payloadConfig = config;
  const payload = await getPayload({ config: payloadConfig });

  try {
    const post = await payload.findByID({
      collection: 'posts',
      id: resolvedParams.id,
      depth: 1,
    });

    return {
      title: `${post.title} | Wanichanon.blog`,
      description: post.excerpt,
      keywords: post.tags?.map(tag => tag.tag).join(', ') || '',
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.date,
        authors: ['Wanichanon Sae-Lee'],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
      },
    };
  } catch {
    return {
      title: 'Post Not Found | Wanichanon.blog',
      description: 'The requested blog post could not be found.',
    };
  }
}

export default async function PostPage({ params }) {
  const resolvedParams = await params;
  const _fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`;

  return (
    <>
      <Navigation active="articles" />
      <PostContent postId={resolvedParams.id} />
      <Footer />
    </>
  );
}