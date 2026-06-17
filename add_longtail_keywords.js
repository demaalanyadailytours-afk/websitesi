const fs = require('fs');

const dir = '.';
const newKeywords = ", Alanya tekne turu fiyatları 2026, Alanya boat tour prices, Belek çıkışlı Tazı Kanyonu turu, Side'den Alanya turları, Family friendly tours in Alanya, Korsan tekne turu çocuk indirimli, Best travel agency in Alanya, Alanya güvenilir tur acentesi";

let modifiedCount = 0;
let htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We added keywords in the previous step, so we just find it and inject the new ones
  // It looks like: <meta name="keywords" content="... existing keywords ..." />
  
  if (content.includes('<meta name="keywords" content="')) {
    content = content.replace(/(<meta name="keywords" content="[^"]*)(" \/>)/, `$1${newKeywords}$2`);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log('Successfully updated ' + modifiedCount + ' files with long-tail keywords.');
