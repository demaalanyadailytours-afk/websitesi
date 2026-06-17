const fs = require('fs');

let modifiedCount = 0;
fs.readdirSync('.').forEach(f => {
  if (f.startsWith('tour-') && f.endsWith('.html')) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // Remove list items related to pickup times, carefully matching only <li> tags
    content = content.replace(/<li\b[^>]*>.*?<\/li>\s*/gis, (match) => {
      const text = match.toLowerCase();
      const hasTime = /\d{1,2}:\d{2}/.test(text);
      
      // Matches specific pickup time sentences
      const isExplicitPickup = hasTime && (
        (text.includes('otel') && (text.includes('alın') || text.includes('alaca') || text.includes('alış'))) ||
        text.includes('alış saati') ||
        text.includes('alınış saati')
      );

      // Matches general statements that become irrelevant when pickup times are removed
      const isGeneralPickupMention = 
        text.includes('tur için iki farklı saat seçeneği') ||
        text.includes('belirtilen saatler ortalama alınış saatleridir') ||
        text.includes('iki seçenekten istediğiniz saate rezervasyon yapabilirsiniz') ||
        text.includes('otelden alınış saati');

      if (isExplicitPickup || isGeneralPickupMention) {
        // Return empty string to completely remove the line
        return '';
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(f, content, 'utf8');
      modifiedCount++;
    }
  }
});
console.log('Modified', modifiedCount, 'files');
