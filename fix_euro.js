const fs = require('fs');

const dir = '.';
let modifiedCount = 0;
let htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace any '€' that is NOT already inside the span
  // First, temporarily replace already fixed ones to avoid double wrapping just in case
  content = content.replace(/<span class="notranslate" translate="no">€<\/span>/g, '###EURO_FIXED###');
  
  // Now replace all other '€'
  content = content.replace(/€/g, '<span class="notranslate" translate="no">€</span>');

  // Restore the previously fixed ones
  content = content.replace(/###EURO_FIXED###/g, '<span class="notranslate" translate="no">€</span>');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log('Fixed Euro symbol in ' + modifiedCount + ' files.');
