const fs = require('fs');

const dir = '.';
const keywords = "Dema Alanya, Alanya Daily Tours, Alanya Tours, Antalya Turu, Alanya günlük turlar, Antalya excursions, Alanya denné výlety, zájazdy do Antalye, Wycieczki fakultatywne Alanya, Экскурсии в Алании, Alanya Ausflüge, Alanya Boat Trip, Safari Alanya";

const jsonLd = `
  <!-- SEO: Schema.org LocalBusiness -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Dema Alanya Daily Tours",
    "image": "https://demaalanyadailytours.com/LOGO.png",
    "url": "https://demaalanyadailytours.com/",
    "telephone": "+905514336045",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Alanya",
      "addressRegion": "Antalya",
      "addressCountry": "TR"
    },
    "description": "Dema Alanya Daily Tours offers the best daily excursions, boat trips, and safaris in Alanya and Antalya regions."
  }
  </script>
`;

let urls = [];
let htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Append keywords meta tag if it doesn't exist
  if (!content.includes('<meta name="keywords"')) {
    // find description tag or title tag
    if (content.includes('<meta name="description"')) {
      content = content.replace(/(<meta name="description"[^>]+>)/i, `$1\n  <meta name="keywords" content="${keywords}" />`);
    } else if (content.includes('</title>')) {
      content = content.replace(/(<\/title>)/i, `$1\n  <meta name="keywords" content="${keywords}" />`);
    }
  } else {
    // If it exists, replace content
    content = content.replace(/<meta name="keywords" content="[^"]*"/i, `<meta name="keywords" content="${keywords}"`);
  }

  // Inject JSON-LD in index.html specifically
  if (file === 'index.html') {
    if (!content.includes('application/ld+json')) {
      content = content.replace('</head>', `${jsonLd}</head>`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }

  // For sitemap
  urls.push(`https://demaalanyadailytours.com/${file === 'index.html' ? '' : file}`);
});

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${url.endsWith('.com/') ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap, 'utf8');

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://demaalanyadailytours.com/sitemap.xml
`;
fs.writeFileSync('robots.txt', robotsTxt, 'utf8');

console.log('SEO updates complete.');
