export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/unsubscribe'],
      },
    ],
    sitemap: 'https://myrashifal.in/sitemap.xml',
  };
}
