'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { posts } from '../posts';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';

// Simple markdown-like renderer for blog content
function renderContent(content) {
  const lines = content.trim().split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];
  let tableHeaders = [];

  function flushTable() {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="text-left py-2 px-3 text-gold-light font-semibold">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-text-secondary">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').filter(Boolean);
      if (!inTable) {
        // Check if next line is separator
        const nextLine = lines[i + 1] || '';
        if (nextLine.includes('---')) {
          tableHeaders = cells;
          inTable = true;
          i++; // skip separator
          continue;
        }
      }
      if (inTable) {
        tableRows.push(cells);
        continue;
      }
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-heading font-bold text-text-primary mt-10 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-heading font-bold text-text-primary mt-8 mb-3">
          {line.slice(4)}
        </h3>
      );
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-3 border-gold-primary bg-gold-primary/5 pl-4 py-3 my-4 text-text-secondary italic rounded-r-lg"
        >
          {line.slice(2)}
        </blockquote>
      );
    }
    // List items
    else if (line.match(/^[-*] \*\*/)) {
      const text = line.slice(2);
      elements.push(
        <li key={i} className="text-text-secondary mb-2 ml-4 list-disc" dangerouslySetInnerHTML={{
          __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
        }} />
      );
    }
    else if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\. /, '');
      elements.push(
        <li key={i} className="text-text-secondary mb-2 ml-4 list-decimal" dangerouslySetInnerHTML={{
          __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-gold-light underline">$1</a>')
        }} />
      );
    }
    // Paragraph
    else if (line.trim().length > 0 && !line.startsWith('#')) {
      elements.push(
        <p key={i} className="text-text-secondary leading-relaxed mb-4" dangerouslySetInnerHTML={{
          __html: line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-gold-light underline">$1</a>')
        }} />
      );
    }
  }

  if (inTable) flushTable();
  return elements;
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">Post not found</h1>
          <Link href="/blog" className="text-gold-light underline">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-gold-light">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gold-light">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-text-secondary/70">{post.title.slice(0, 40)}...</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-text-secondary mb-4">
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
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            {post.description}
          </p>
        </header>

        {/* Content */}
        <div className="prose-custom">
          {renderContent(post.content)}
        </div>

        <InArticleAd className="max-w-2xl mx-auto" />

        {/* Ad — after article content */}
        <AdBanner format="auto" className="max-w-2xl mx-auto" />

        {/* CTA */}
        <div className="mt-16 card-mystical p-8 text-center">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Try MyRashifal+ Free
          </h2>
          <p className="text-text-secondary mb-5">
            Generate your Vedic Kundli, read daily Rashifal, and get AI-powered astrology insights.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/kundli"
              className="bg-gold-primary text-bg-primary font-semibold px-6 py-3 rounded-lg hover:bg-gold-light transition-colors"
            >
              Free Kundli
            </Link>
            <Link
              href="/rashifal"
              className="border border-gold-primary/30 text-gold-light font-semibold px-6 py-3 rounded-lg hover:bg-gold-primary/10 transition-colors"
            >
              Daily Rashifal
            </Link>
          </div>
        </div>

        {/* Back */}
        <div className="mt-10">
          <Link href="/blog" className="text-gold-light text-sm hover:underline">
            &larr; Back to all articles
          </Link>
        </div>
      </article>
    </div>
  );
}
