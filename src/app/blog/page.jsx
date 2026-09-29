'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { posts } from './posts';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BlogPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('all');

  // Distinct years present in posts, newest first — for the date filter
  const years = useMemo(() => {
    const set = new Set(posts.map((p) => new Date(p.date).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  // Sort newest-first, then apply search + year filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((p) => year === 'all' || new Date(p.date).getFullYear() === Number(year))
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.keywords || '').toLowerCase().includes(q)
        );
      });
  }, [query, year]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-3">
            Vedic Astrology <span className="text-gold-primary">Blog</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Learn about Kundli reading, Rashifal, Nakshatras, planetary transits, and Vedic Jyotish Shastra.
          </p>
        </div>

        {/* Search + date filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold-primary/20 bg-white/60 text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-gold-primary/50 focus:ring-2 focus:ring-gold-primary/15 transition-colors"
            />
          </div>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Filter by year"
            className="py-3 px-4 rounded-lg border border-gold-primary/20 bg-white/60 text-text-primary focus:outline-none focus:border-gold-primary/50 focus:ring-2 focus:ring-gold-primary/15 transition-colors cursor-pointer"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <p className="text-text-secondary text-sm mb-6">
          {filtered.length === posts.length
            ? `${posts.length} articles`
            : `${filtered.length} of ${posts.length} articles`}
        </p>

        {/* Posts grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-6">
            {filtered.map((post) => (
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
        ) : (
          <div className="text-center py-16 card-mystical">
            <p className="text-text-primary font-medium mb-1">No articles found</p>
            <p className="text-text-secondary text-sm mb-4">
              Try a different search term or year.
            </p>
            <button
              onClick={() => { setQuery(''); setYear('all'); }}
              className="text-gold-primary text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

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
