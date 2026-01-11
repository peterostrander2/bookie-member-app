import React, { useEffect, useMemo, createContext, useContext, useCallback } from 'react';

// ============================================================================
// SEO OPTIMIZATION - Priority 8C
// Meta tags, Open Graph, Twitter Cards, Structured Data, Sitemap
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const SEO_CONFIG = {
  siteName: 'Bookie-o-em',
  siteUrl: 'https://bookie-o-em.com',
  defaultTitle: 'Bookie-o-em | AI Sports Betting Intelligence',
  defaultDescription: 'AI-powered sports betting analytics with sharp money tracking, injury analysis, and esoteric signals. Make smarter bets with data-driven insights.',
  defaultImage: '/og-image.png',
  twitterHandle: '@bookieoem',
  locale: 'en_US',
  themeColor: '#0f172a',
  author: 'Bookie-o-em Team',
  keywords: [
    'sports betting',
    'AI picks',
    'sharp money',
    'betting analytics',
    'NFL betting',
    'NBA betting',
    'MLB betting',
    'NHL betting',
    'betting signals',
    'CLV tracking',
    'injury analysis'
  ]
};

// Page-specific SEO configurations
const PAGE_SEO = {
  '/': {
    title: 'Dashboard',
    description: 'Your AI betting dashboard with today\'s top picks, sharp money alerts, and real-time signals.',
    keywords: ['betting dashboard', 'daily picks', 'AI predictions']
  },
  '/smash-spots': {
    title: 'Smash Spots',
    description: 'High-confidence betting picks powered by 17 AI signals. Find the best value bets with our proprietary analysis.',
    keywords: ['best bets', 'high confidence picks', 'value bets', 'AI picks']
  },
  '/sharp-alerts': {
    title: 'Sharp Money Alerts',
    description: 'Track where professional bettors are putting their money. Real-time sharp money movement and steam moves.',
    keywords: ['sharp money', 'professional bettors', 'steam moves', 'line movement']
  },
  '/best-odds': {
    title: 'Best Odds Comparison',
    description: 'Compare odds across all major sportsbooks. Find the best lines and maximize your expected value.',
    keywords: ['odds comparison', 'best lines', 'sportsbook odds', 'line shopping']
  },
  '/injuries': {
    title: 'Injury Vacuum Analysis',
    description: 'Comprehensive injury analysis with impact scoring. See how injuries affect betting lines and player usage.',
    keywords: ['injury report', 'player injuries', 'injury impact', 'usage vacuum']
  },
  '/performance': {
    title: 'Performance Dashboard',
    description: 'Track your betting performance with detailed analytics. ROI, win rate, and historical accuracy by sport.',
    keywords: ['betting performance', 'ROI tracking', 'bet history', 'win rate']
  },
  '/bankroll': {
    title: 'Bankroll Management',
    description: 'Professional bankroll management tools. Kelly Criterion calculator, unit sizing, and risk management.',
    keywords: ['bankroll management', 'kelly criterion', 'unit sizing', 'risk management']
  },
  '/community': {
    title: 'Community Hub',
    description: 'Join the betting community. Leaderboards, consensus voting, and follow top bettors.',
    keywords: ['betting community', 'leaderboard', 'consensus picks', 'social betting']
  },
  '/esoteric': {
    title: 'Esoteric Signals',
    description: 'Explore unconventional betting signals including gematria, moon phases, and numerology patterns.',
    keywords: ['esoteric betting', 'gematria', 'moon phases', 'numerology']
  },
  '/analytics': {
    title: 'Advanced Analytics',
    description: 'Bet simulator, parlay optimizer, hedge calculator, and arbitrage finder. Advanced tools for serious bettors.',
    keywords: ['bet simulator', 'parlay calculator', 'hedge calculator', 'arbitrage']
  },
  '/grading': {
    title: 'Pick Grading System',
    description: 'Grade and review your picks to improve future betting decisions. Learn from wins and losses.',
    keywords: ['pick grading', 'bet review', 'betting improvement']
  },
  '/notifications': {
    title: 'Notification Center',
    description: 'Configure alerts for sharp money, line moves, injuries, and more. Never miss an opportunity.',
    keywords: ['betting alerts', 'notifications', 'line movement alerts']
  }
};

// ============================================================================
// SEO CONTEXT
// ============================================================================

const SEOContext = createContext(null);

export const useSEO = () => {
  const ctx = useContext(SEOContext);
  if (!ctx) throw new Error('useSEO must be used within SEOProvider');
  return ctx;
};

export const SEOProvider = ({ children, config = {} }) => {
  const mergedConfig = { ...SEO_CONFIG, ...config };

  const setPageSEO = useCallback((pageConfig) => {
    updateMetaTags({ ...mergedConfig, ...pageConfig });
  }, [mergedConfig]);

  const value = {
    config: mergedConfig,
    setPageSEO,
    pageSEO: PAGE_SEO
  };

  return (
    <SEOContext.Provider value={value}>
      {children}
    </SEOContext.Provider>
  );
};

// ============================================================================
// META TAG UTILITIES
// ============================================================================

const updateMetaTags = (config) => {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName,
    twitterHandle,
    locale,
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    noindex = false
  } = config;

  // Helper to set or create meta tag
  const setMeta = (name, content, property = false) => {
    if (!content) return;
    const attr = property ? 'property' : 'name';
    let element = document.querySelector(`meta[${attr}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Title
  const fullTitle = title
    ? `${title} | ${siteName || SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaultTitle;
  document.title = fullTitle;

  // Basic meta tags
  setMeta('description', description || SEO_CONFIG.defaultDescription);
  setMeta('keywords', [...SEO_CONFIG.keywords, ...keywords].join(', '));
  setMeta('author', author || SEO_CONFIG.author);
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

  // Open Graph tags
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', description || SEO_CONFIG.defaultDescription, true);
  setMeta('og:image', image || SEO_CONFIG.defaultImage, true);
  setMeta('og:url', url || window.location.href, true);
  setMeta('og:type', type, true);
  setMeta('og:site_name', siteName || SEO_CONFIG.siteName, true);
  setMeta('og:locale', locale || SEO_CONFIG.locale, true);

  // Twitter Card tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:site', twitterHandle || SEO_CONFIG.twitterHandle);
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', description || SEO_CONFIG.defaultDescription);
  setMeta('twitter:image', image || SEO_CONFIG.defaultImage);

  // Article-specific (for blog posts, etc.)
  if (type === 'article') {
    setMeta('article:published_time', publishedTime, true);
    setMeta('article:modified_time', modifiedTime, true);
  }

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url || window.location.href);
};

// ============================================================================
// SEO HEAD COMPONENT
// ============================================================================

export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords = [],
  noindex = false,
  structuredData = null,
  children
}) => {
  useEffect(() => {
    updateMetaTags({
      title,
      description,
      image,
      url,
      type,
      keywords,
      noindex,
      ...SEO_CONFIG
    });

    // Add structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Cleanup structured data on unmount
      if (structuredData) {
        const script = document.querySelector('script[type="application/ld+json"]');
        if (script) script.remove();
      }
    };
  }, [title, description, image, url, type, keywords, noindex, structuredData]);

  return children || null;
};

// ============================================================================
// PAGE SEO HOOK
// ============================================================================

export const usePageSEO = (path) => {
  const pageSEO = PAGE_SEO[path] || {};

  useEffect(() => {
    updateMetaTags({
      ...SEO_CONFIG,
      ...pageSEO
    });
  }, [path, pageSEO]);

  return pageSEO;
};

// ============================================================================
// STRUCTURED DATA GENERATORS
// ============================================================================

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}/logo.png`,
  description: SEO_CONFIG.defaultDescription,
  sameAs: [
    'https://twitter.com/bookieoem',
    'https://discord.gg/bookieoem'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English'
  }
});

export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  description: SEO_CONFIG.defaultDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});

export const generateSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SEO_CONFIG.siteName,
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250'
  }
});

export const generateBettingPickSchema = (pick) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: `${pick.team} ${pick.spread || pick.line} - ${pick.sport} Pick`,
  description: `AI-powered betting pick: ${pick.team} ${pick.spread || pick.line}. Confidence: ${pick.confidence}%`,
  author: {
    '@type': 'Organization',
    name: SEO_CONFIG.siteName
  },
  publisher: {
    '@type': 'Organization',
    name: SEO_CONFIG.siteName,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.siteUrl}/logo.png`
    }
  },
  datePublished: new Date(pick.date).toISOString(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SEO_CONFIG.siteUrl}/picks/${pick.id}`
  }
});

export const generateSportsEventSchema = (game) => ({
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: `${game.away} vs ${game.home}`,
  startDate: new Date(game.startTime).toISOString(),
  location: {
    '@type': 'Place',
    name: game.venue || 'TBD',
    address: {
      '@type': 'PostalAddress',
      addressLocality: game.city || ''
    }
  },
  homeTeam: {
    '@type': 'SportsTeam',
    name: game.home
  },
  awayTeam: {
    '@type': 'SportsTeam',
    name: game.away
  },
  competitor: [
    { '@type': 'SportsTeam', name: game.home },
    { '@type': 'SportsTeam', name: game.away }
  ]
});

export const generateFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const generateBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

// ============================================================================
// SITEMAP GENERATOR
// ============================================================================

export const generateSitemap = (additionalUrls = []) => {
  const staticPages = Object.keys(PAGE_SEO);
  const allUrls = [...staticPages, ...additionalUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${SEO_CONFIG.siteUrl}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

Sitemap: ${SEO_CONFIG.siteUrl}/sitemap.xml

# Disallow admin and private pages
Disallow: /admin
Disallow: /api/
Disallow: /private/

# Allow important pages
Allow: /smash-spots
Allow: /sharp-alerts
Allow: /best-odds
Allow: /injuries
Allow: /performance
Allow: /bankroll
Allow: /community
`;
};

// ============================================================================
// IMAGE OPTIMIZATION UTILITIES
// ============================================================================

export const getOptimizedImageUrl = (src, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // If using a CDN like Cloudinary, Imgix, etc.
  // This is a placeholder for CDN URL transformation
  const params = new URLSearchParams();
  if (width) params.set('w', width);
  if (height) params.set('h', height);
  params.set('q', quality);
  params.set('fm', format);

  // Return original if no CDN configured
  // Replace with actual CDN logic
  return src;
};

export const generateSrcSet = (src, widths = [320, 640, 960, 1280, 1920]) => {
  return widths
    .map(w => `${getOptimizedImageUrl(src, { width: w })} ${w}w`)
    .join(', ');
};

// Optimized Image Component
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  style,
  sizes = '100vw',
  ...props
}) => {
  const srcSet = useMemo(() => generateSrcSet(src), [src]);
  const webpSrc = useMemo(() => getOptimizedImageUrl(src, { format: 'webp' }), [src]);

  return (
    <picture>
      <source srcSet={srcSet} type="image/webp" sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        style={style}
        {...props}
      />
    </picture>
  );
};

// ============================================================================
// PRELOAD & PREFETCH UTILITIES
// ============================================================================

export const preloadResource = (href, as, type = null) => {
  const existing = document.querySelector(`link[href="${href}"][rel="preload"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

export const prefetchPage = (url) => {
  const existing = document.querySelector(`link[href="${url}"][rel="prefetch"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

export const preconnect = (origin) => {
  const existing = document.querySelector(`link[href="${origin}"][rel="preconnect"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// ============================================================================
// CRITICAL CSS INLINE
// ============================================================================

export const inlineCriticalCSS = (css) => {
  const existing = document.querySelector('style[data-critical]');
  if (existing) {
    existing.textContent = css;
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-critical', 'true');
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
};

// Critical CSS for above-the-fold content
export const CRITICAL_CSS = `
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --accent-blue: #60a5fa;
    --accent-green: #22c55e;
  }
  body {
    margin: 0;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .skeleton {
    background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      // web-vitals not available
    });
  }
};

export const measurePageLoad = () => {
  if (typeof window === 'undefined' || !window.performance) return null;

  const timing = performance.timing || {};
  const navigation = performance.getEntriesByType?.('navigation')?.[0] || {};

  return {
    // Navigation timing
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    ttfb: timing.responseStart - timing.requestStart,
    download: timing.responseEnd - timing.responseStart,
    domParsing: timing.domInteractive - timing.responseEnd,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    load: timing.loadEventEnd - timing.navigationStart,

    // Resource counts
    resourceCount: performance.getEntriesByType?.('resource')?.length || 0,

    // Memory (if available)
    memory: performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    } : null
  };
};

// ============================================================================
// SEO AUDIT COMPONENT
// ============================================================================

export const SEOAudit = () => {
  const auditResults = useMemo(() => {
    const results = [];

    // Check title
    const title = document.title;
    results.push({
      name: 'Page Title',
      status: title && title.length >= 30 && title.length <= 60 ? 'pass' : 'warning',
      value: title || 'Missing',
      recommendation: title.length < 30 ? 'Title too short' : title.length > 60 ? 'Title too long' : 'Good'
    });

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.content;
    results.push({
      name: 'Meta Description',
      status: metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160 ? 'pass' : 'warning',
      value: metaDesc ? `${metaDesc.substring(0, 50)}...` : 'Missing',
      recommendation: !metaDesc ? 'Add meta description' : metaDesc.length < 120 ? 'Too short' : metaDesc.length > 160 ? 'Too long' : 'Good'
    });

    // Check Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
    const ogDesc = document.querySelector('meta[property="og:description"]')?.content;
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;
    results.push({
      name: 'Open Graph',
      status: ogTitle && ogDesc && ogImage ? 'pass' : 'fail',
      value: ogTitle && ogDesc && ogImage ? 'Complete' : 'Incomplete',
      recommendation: !ogTitle ? 'Add og:title' : !ogDesc ? 'Add og:description' : !ogImage ? 'Add og:image' : 'Good'
    });

    // Check Twitter Cards
    const twitterCard = document.querySelector('meta[name="twitter:card"]')?.content;
    results.push({
      name: 'Twitter Cards',
      status: twitterCard ? 'pass' : 'warning',
      value: twitterCard || 'Missing',
      recommendation: twitterCard ? 'Good' : 'Add twitter:card meta tag'
    });

    // Check canonical
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    results.push({
      name: 'Canonical URL',
      status: canonical ? 'pass' : 'warning',
      value: canonical ? 'Set' : 'Missing',
      recommendation: canonical ? 'Good' : 'Add canonical link'
    });

    // Check H1
    const h1s = document.querySelectorAll('h1');
    results.push({
      name: 'H1 Tag',
      status: h1s.length === 1 ? 'pass' : h1s.length === 0 ? 'fail' : 'warning',
      value: `${h1s.length} found`,
      recommendation: h1s.length === 0 ? 'Add H1 tag' : h1s.length > 1 ? 'Use only one H1' : 'Good'
    });

    // Check images alt
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt).length;
    results.push({
      name: 'Image Alt Tags',
      status: imagesWithAlt === images.length ? 'pass' : 'warning',
      value: `${imagesWithAlt}/${images.length}`,
      recommendation: imagesWithAlt < images.length ? 'Add alt to all images' : 'Good'
    });

    // Check structured data
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    results.push({
      name: 'Structured Data',
      status: structuredData ? 'pass' : 'warning',
      value: structuredData ? 'Present' : 'Missing',
      recommendation: structuredData ? 'Good' : 'Add JSON-LD schema'
    });

    return results;
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{
        color: '#f8fafc',
        margin: '0 0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span>🔍</span>
        SEO Audit
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {auditResults.map((result, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              background: result.status === 'pass'
                ? 'rgba(34, 197, 94, 0.1)'
                : result.status === 'warning'
                ? 'rgba(251, 191, 36, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 8,
              borderLeft: `3px solid ${
                result.status === 'pass' ? '#22c55e'
                : result.status === 'warning' ? '#fbbf24'
                : '#ef4444'
              }`
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: '#f1f5f9' }}>{result.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{result.recommendation}</div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{result.value}</span>
              <span style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: result.status === 'pass' ? '#22c55e'
                  : result.status === 'warning' ? '#fbbf24'
                  : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14
              }}>
                {result.status === 'pass' ? '✓' : result.status === 'warning' ? '!' : '✗'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: 20,
        padding: 16,
        background: 'rgba(96, 165, 250, 0.1)',
        borderRadius: 10
      }}>
        <h4 style={{ color: '#60a5fa', margin: '0 0 12px', fontSize: 14 }}>
          Quick Actions
        </h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const sitemap = generateSitemap();
              const blob = new Blob([sitemap], { type: 'application/xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sitemap.xml';
              a.click();
            }}
            style={{
              padding: '8px 14px',
              background: 'rgba(96, 165, 250, 0.2)',
              border: 'none',
              borderRadius: 6,
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            📥 Download Sitemap
          </button>
          <button
            onClick={() => {
              const robots = generateRobotsTxt();
              const blob = new Blob([robots], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'robots.txt';
              a.click();
            }}
            style={{
              padding: '8px 14px',
              background: 'rgba(96, 165, 250, 0.2)',
              border: 'none',
              borderRadius: 6,
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            📥 Download robots.txt
          </button>
          <button
            onClick={() => {
              const schema = generateOrganizationSchema();
              navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
            }}
            style={{
              padding: '8px 14px',
              background: 'rgba(96, 165, 250, 0.2)',
              border: 'none',
              borderRadius: 6,
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            📋 Copy Schema.org
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SEO DASHBOARD
// ============================================================================

export const SEODashboard = () => {
  const metrics = useMemo(() => measurePageLoad(), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      padding: 20
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 32,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px'
        }}>
          🔍 SEO Optimization
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Meta tags, structured data, and performance metrics
        </p>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24
        }}>
          <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>⚡</span>
            Page Performance
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12
          }}>
            <div style={{
              padding: 16,
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
                {metrics.ttfb}ms
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>TTFB</div>
            </div>
            <div style={{
              padding: 16,
              background: 'rgba(96, 165, 250, 0.1)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>
                {metrics.domContentLoaded}ms
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>DOM Ready</div>
            </div>
            <div style={{
              padding: 16,
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
                {metrics.load}ms
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Full Load</div>
            </div>
            <div style={{
              padding: 16,
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#a855f7' }}>
                {metrics.resourceCount}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Resources</div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Audit */}
      <SEOAudit />
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SEO_CONFIG,
  PAGE_SEO,
  updateMetaTags
};

export default SEODashboard;
