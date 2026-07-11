const fs = require('fs');
const path = require('path');

const GARLAND_DIR = path.join(__dirname, 'public', 'products', 'Garlands');
const PRODUCTS_JSON = path.join(__dirname, 'public', 'products.json');

const TITLES = [
  "Premium Marigold & Jasmine Festival Garland",
  "Traditional Rose Puja Garland",
  "Vibrant Carnation Wedding Garland",
  "Elegant Artificial Lotus Garland",
  "Golden Tissue & Pearl Decorative Garland",
  "Royal Red Rose and White Pearl Varmala",
  "Classic Orange Marigold Toran",
  "Auspicious Yellow Chrysanthemum Garland",
  "Exotic Orchid & Jasmine Bridal Garland",
  "Handcrafted Velvet Rose Garland",
  "Divine Tulsi & Floral Garland",
  "Sandalwood Fragrance Jasmine Garland",
  "Majestic Mogra and Rose Petal Garland",
  "Festive Yellow & Orange Marigold Mala",
  "Premium Satin Ribbon Decorative Garland"
];

const DESCRIPTIONS = [
  "Add a touch of elegance and tradition to your special occasions with this premium, handcrafted garland. Perfect for weddings, pujas, and festive decorations. Made with high-quality materials to ensure long-lasting freshness and beauty.",
  "Elevate your home decor and spiritual ceremonies with this vibrant and beautiful garland. Expertly woven for a full, lush appearance, it is the perfect offering or decorative piece for any festive celebration.",
  "Designed with intricate detailing, this garland exudes luxury and cultural richness. Its vivid colors and meticulous craftsmanship make it an ideal choice for grand weddings, deity adorning, and vibrant home decoration.",
  "Bring auspicious vibes and stunning visual appeal to your events. This traditional garland blends timeless artistry with bright, vibrant hues to create a stunning centerpiece for any spiritual or joyous occasion.",
  "Crafted with love and precision, this garland features a delicate balance of colors and textures. Ideal for daily prayers, welcoming guests, or adding a festive charm to your living spaces."
];

async function processGarlands() {
  try {
    const files = fs.readdirSync(GARLAND_DIR).filter(f => !f.startsWith('.'));
    console.log(`Found ${files.length} images to process.`);

    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'));
    const garlandsArray = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file);
      
      const randomTitle = TITLES[i % TITLES.length];
      const randomDesc = DESCRIPTIONS[i % DESCRIPTIONS.length];
      const uniqueId = `garland-${Date.now()}-${i}`;
      
      const newName = `${randomTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}${ext}`;
      const oldPath = path.join(GARLAND_DIR, file);
      const newPath = path.join(GARLAND_DIR, newName);

      fs.renameSync(oldPath, newPath);

      const product = {
        id: uniqueId,
        name: randomTitle,
        category: "Garlands",
        subCategory: "Decorative",
        price: 0,
        actualPrice: 0,
        discountPercentage: 0,
        image: `/products/Garlands/${newName}`,
        stock: 50,
        isReturnGift: false,
        description: randomDesc
      };

      garlandsArray.push(product);
    }

    if (productsData.Garlands) {
      if (productsData.Garlands.Decorative) {
        productsData.Garlands.Decorative = productsData.Garlands.Decorative.concat(garlandsArray);
      } else {
        productsData.Garlands.Decorative = garlandsArray;
      }
    } else {
      productsData.Garlands = { Decorative: garlandsArray };
    }

    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(productsData, null, 2));
    console.log("Successfully processed and renamed all garlands and updated products.json.");
  } catch (err) {
    console.error("Error processing garlands:", err);
  }
}

processGarlands();
