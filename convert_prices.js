const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '.');
const EXCHANGE_RATE = 53.5;

function convertPrice(tlPriceStr) {
  const tlPrice = parseFloat(tlPriceStr);
  if (isNaN(tlPrice) || tlPrice === 0) return 0;
  return Math.ceil(tlPrice / EXCHANGE_RATE);
}

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  
  let modifiedCount = 0;
  
  files.forEach(function (file) {
    if (path.extname(file) === '.html') {
      const filePath = path.join(directoryPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Case 1 & 2: (\d+(?:\.\d+)?)\s*₺
      content = content.replace(/(\d+(?:\.\d+)?)\s*₺/g, (match, p1) => {
        const converted = convertPrice(p1);
        return `${converted} €`;
      });
      
      // Case 3: data-price="972"
      content = content.replace(/data-price="(\d+(?:\.\d+)?)"/g, (match, p1) => {
        const converted = convertPrice(p1);
        return `data-price="${converted}"`;
      });

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
      }
    }
  });
  
  console.log(`Successfully updated ${modifiedCount} HTML files.`);
  
  // Update main.js
  const mainJsPath = path.join(directoryPath, 'main.js');
  if (fs.existsSync(mainJsPath)) {
    let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    let originalMainJs = mainJsContent;
    
    mainJsContent = mainJsContent.replace(/total\.toFixed\(2\)\s*\+\s*' ₺'/g, "Math.round(total) + ' €'");
    
    if (mainJsContent !== originalMainJs) {
      fs.writeFileSync(mainJsPath, mainJsContent, 'utf8');
      console.log('Successfully updated main.js');
    }
  }
});
