import { posts } from './blog/posts';

const RASHI_SLUGS = [
  'mesh', 'vrishabh', 'mithun', 'kark', 'singh', 'kanya',
  'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen',
];

export default function sitemap() {
  const baseUrl = 'https://myrashifal.in';

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/kundli', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/rashifal', priority: 0.9, changeFrequency: 'daily' },
    { path: '/matching', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/reports', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/muhurat', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/ask', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/panchang', priority: 0.8, changeFrequency: 'daily' },
    { path: '/numerology', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/transits', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/remedies', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/astrologers', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/download', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/feedback', priority: 0.4, changeFrequency: 'monthly' },
  ];

  const rashiPages = RASHI_SLUGS.map((slug) => ({
    url: `${baseUrl}/rashifal/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const pages = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...pages, ...rashiPages, ...blogPosts];
}
