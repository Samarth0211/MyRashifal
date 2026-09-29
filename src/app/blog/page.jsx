'use client';

import Link from 'next/link';
import { posts } from './posts';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BlogPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-3">
            Vedic Astrology <span className="text-gold-primary">Blog</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Learn about Kundli reading, Rashifal, Nakshatras, planetary transits, and Vedic Jyotish Shastra.
          </p>
        </div>

        {/* Posts grid */}
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <article className="card-mystical p-6 md:p-8 transition-all duration-300 hover:border-gold-primary/20">
                <div className="flex items-center gap-3 text-sm text-text-secondary mb-3">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                  <span>|</span>
                  <span>{post.readTime} read</span>
                </div>
                <h2 className="text-xl md:text-2xl font-heading font-bold text-text-primary mb-2 group-hover:text-gold-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  {post.description}
                </p>
                <span className="inline-block mt-4 text-gold-light text-sm font-medium">
                  Read article &rarr;
                </span>
              </article>
            </Link>
          ))}
        </div>

        <InArticleAd className="max-w-4xl mx-auto" />

        <AdBanner format="auto" className="max-w-4xl mx-auto mt-4" />

        {/* Newsletter CTA */}
        <div className="mt-16 text-center card-mystical p-8">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Get Daily Rashifal in Your Inbox
          </h2>
          <p className="text-text-secondary mb-4">
            Subscribe to receive your personalized daily horoscope at 7 AM IST
          </p>
          <Link
            href="/#newsletter"
            className="inline-block bg-gold-primary text-bg-primary font-semibold px-6 py-3 rounded-lg hover:bg-gold-light transition-colors"
          >
            Subscribe Free
          </Link>
        </div>
      </div>
    </div>
  );
}
