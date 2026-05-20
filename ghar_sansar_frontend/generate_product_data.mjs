import fs from 'fs/promises';
import path from 'path';
// You will need to install this package: npm install @google/genai
// import { GoogleGenAI } from '@google/genai';

const directoryPath = path.join(process.cwd(), 'public/products/23 evening');
const outputJsonPath = path.join(process.cwd(), 'public/products/23_evening_products.json');

// NOTE: To actually use the Gemini API, you need an API key.
// Set your key in the environment before running: set GEMINI_API_KEY=your_key
// const ai = new GoogleGenAI({});

async function generateDetailsForImage(imagePath, filename) {
  try {
    // If you enable the Google Gen AI client:
    /*
    const imageBuff = await fs.readFile(imagePath);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: 'Analyze this image and provide a JSON response with two keys: "name" (a catchy product name) and "description" (a detailed product description suitable for an e-commerce store).' },
        {
          inlineData: {
             data: imageBuff.toString('base64'),
             mimeType: 'image/jpeg'
          }
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    // Parse the JSON output
    const resultText = response.text();
    const resultObj = JSON.parse(resultText);
    return {
      name: resultObj.name,
      description: resultObj.description
    };
    */

    // Mock return for now since API key is not configured in this script:
    const randomPrices = [99, 149, 199, 299, 399, 499, 599, 799, 999];
    const price = randomPrices[Math.floor(Math.random() * randomPrices.length)];
    return {
      name: `Elegant Decor Item ${filename.substring(filename.length - 8, filename.length - 4)}`,
      description: `A beautifully crafted item perfect for enhancing your home's aesthetic. High quality materials and elegant design. (Placeholder description for ${filename})`,
      price: price,
      actualPrice: price + 200
    };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
    return {
      name: filename,
      description: 'Error generating description.'
    };
  }
}

async function main() {
  try {
    const files = await fs.readdir(directoryPath);
    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i));

    console.log(`Found ${imageFiles.length} images. Starting generation...`);

    const products = [];

    // Process in small batches or sequentially to avoid rate limits
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      console.log(`Processing ${i + 1}/${imageFiles.length}: ${file}`);

      const imagePath = path.join(directoryPath, file);
      const details = await generateDetailsForImage(imagePath, file);

      const productEntry = {
        id: `23-evening-${i + 1}`,
        name: details.name,
        image: `/products/23 evening/${file}`,
        description: details.description,
        price: details.price || 0,
        originalPrice: details.actualPrice || 0,
        category: "23_evening",
        filename: file
      };

      products.push(productEntry);

      // Add a small delay between requests if using real API to prevent 429 errors
      // await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await fs.writeFile(outputJsonPath, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`\nSuccess! Generated data saved to ${outputJsonPath}`);

  } catch (err) {
    console.error("Error generating product data:", err);
  }
}

main();
