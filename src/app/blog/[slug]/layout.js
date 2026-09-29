import Script from 'next/script';
import { posts } from '../posts';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://myrashifal.in/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://myrashifal.in/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      siteName: 'MyRashifal+',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostLayout({ children, params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) return children;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'MyRashifal+',
      url: 'https://myrashifal.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MyRashifal+',
      logo: {
        '@type': 'ImageObject',
        url: 'https://myrashifal.in/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://myrashifal.in/blog/${post.slug}`,
    },
    image: 'https://myrashifal.in/og-image.png',
    wordCount: post.content?.split(/\s+/).length || 800,
    keywords: post.keywords,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://myrashifal.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://myrashifal.in/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://myrashifal.in/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
