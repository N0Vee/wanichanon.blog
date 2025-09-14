import { headers as getHeaders } from "next/headers.js";
import { getPayload } from "payload";
import config from "@/payload.config";

import "./styles.css";
import Navigation from "@/app/(frontend)/components/Navigation";
import FeaturedSection from "@/app/(frontend)/sections/FeatureSection";
import ArticleSection from "@/app/(frontend)/sections/ArticleSection";
import NewsletterSection from "@/app/(frontend)/sections/NewsletterSection";
import Footer from "@/app/(frontend)/components/Footer";

export default async function HomePage() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user: _user } = await payload.auth({ headers });

  return (
    <>
      <Navigation />
      <main>
        <section id="featured">
          <FeaturedSection />
        </section>
        <section id="articles">
          <ArticleSection />
        </section>
        <section id="newsletter">
          <NewsletterSection />
        </section>
      </main>
      <Footer />
    </>
  );
}