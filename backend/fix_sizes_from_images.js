const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GARLAND_DIR = path.join(__dirname, 'public', 'products', 'Garlands');
const PRODUCTS_JSON = path.join(__dirname, 'public', 'products.json');

async function fixSizes() {
  try {
    const files = fs.readdirSync(GARLAND_DIR).filter(f => f.endsWith('.png'));
    console.log(`Found ${files.length} garlands.`);

    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'));
    let garlandsCategory = productsData.find(cat => cat.name === 'Garlands' || cat.category === 'Garlands');
    let decorativeSub = garlandsCategory.subcategories.find(sub => sub.name === 'Decorative');

    let updatedCount = 0;

    for (const file of files) {
      const filePath = path.join(GARLAND_DIR, file);
      
      try {
        const ocrOutput = execSync(`tesseract "${filePath}" stdout`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
        
        // Extract size. Looking for a pattern like "15 inches" or "20 inch" or "Height 15"
        const match = ocrOutput.match(/(\d+)\s*inch/i) || ocrOutput.match(/(?:height)?\s*(\d+)/i);
        
        let sizeInches = match ? match[1] : null;

        if (sizeInches) {
          console.log(`File: ${file} -> Found size: ${sizeInches} inches`);
          
          // Find this product in the JSON
          const product = decorativeSub.products.find(p => p.image.endsWith(file));
          if (product) {
            // Remove the old size we appended (e.g., "- 12 inch (For 8x10 Frame)")
            const baseName = product.name.split(' - ')[0];
            
            // Generate a suitable frame suggestion based on garland height
            let frameSuggestion = "";
            const h = parseInt(sizeInches);
            if (h <= 12) frameSuggestion = "(For 8x10 Frame)";
            else if (h <= 15) frameSuggestion = "(For 10x12 Frame)";
            else if (h <= 18) frameSuggestion = "(For 12x15 Frame)";
            else if (h <= 24) frameSuggestion = "(For 16x20 Frame)";
            else if (h <= 30) frameSuggestion = "(For 20x24 Frame)";
            else frameSuggestion = "(For 24x36 Frame)";

            product.name = `${baseName} - ${sizeInches} inch ${frameSuggestion}`;
            product.title = product.name;
            updatedCount++;
          }
        } else {
          console.log(`File: ${file} -> Could not find size in OCR: ${ocrOutput.replace(/\n/g, ' ')}`);
        }
      } catch (err) {
        console.error(`Error running OCR on ${file}`);
      }
    }

    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(productsData, null, 2));
    console.log(`Successfully updated ${updatedCount} garland sizes based on images.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

fixSizes();
