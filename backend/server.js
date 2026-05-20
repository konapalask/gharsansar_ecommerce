const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static images and files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory databases (would be a real database in production)
const USERS_FILE = path.join(__dirname, "users.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");
const CUSTOMERS_FILE = path.join(__dirname, "customers.json");

// Helper to read/write JSON files safely
const readJsonFile = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
};

// Stable price generator based on product title
const getPricesForProduct = (title) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const base = Math.abs(hash % 20) + 1; // 1 to 20
  const price = base * 2000 + 1999;     // ₹3,999 to ₹41,999
  const actualPrice = Math.floor(price * 1.35 + 499); // 35% markup + 499
  return { price, actualPrice };
};

// Luxury product name and description generator
const generateLuxuryProduct = (filename, index) => {
  let hash = 0;
  const str = filename || `IMG_${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const prefixes = [
    "Handcrafted", "Heritage", "Artisan", "Elysian", "Royal", "Gilded", 
    "Imperial", "Sovereign", "Velvet", "Opulent", "Sleek", "Classic", 
    "Contemporary", "Signature", "Celestial", "Prestige"
  ];
  const materials = [
    "Bronze", "Crystal", "Alabaster", "Tuscan", "Obsidian", "Emerald", 
    "Sapphire", "Silver", "Gold Leaf", "Marble", "Amber", "Platinum"
  ];
  const items = [
    "Vase", "Candelabra", "Sculpture", "Table Accent", "Luxe Urn", 
    "Centerpiece", "Decanter", "Jeweled Box", "Obelisk", "Ornament", 
    "Chalice", "Platter"
  ];

  const prefix = prefixes[hash % prefixes.length];
  const material = materials[(hash + 3) % materials.length];
  const itemType = items[(hash + 7) % items.length];

  const name = `${prefix} ${material} ${itemType}`;

  const descriptions = [
    "An exquisite statement piece designed to elevate the sensory appeal of premium spaces. Crafted by master artisans using time-honored techniques, this item harmonizes luxury with modern architectural details.",
    "A breathtaking masterpiece that merges timeless design with opulent styling. Meticulously finished to serve as a stunning focal point in luxury dining halls and contemporary lounges.",
    "Capturing the essence of refined elegance, this decorative piece adds a sophisticated touch of prestige to any sophisticated residential layout.",
    "Featuring organic contours and a radiant, premium finish, this artisan piece is curated exclusively for connoisseurs of fine lifestyle and bespoke interiors.",
    "An elegant integration of luxurious elements and sculptural form, perfectly designed to inject artistic character and warmth into upscale home decors."
  ];

  const description = descriptions[hash % descriptions.length];

  return { name, description };
};

// Generate realistic names, descriptions, and prices for bottles, flasks, and lunchboxes
const generateRealisticBottleProduct = (filename, index) => {
  let hash = 0;
  const str = filename || `IMG_${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const brands = [
    "Durasteel", "ThermaMax", "Polaris Frost", "Tuff Gym", "EcoShield",
    "Aura Lifestyles", "HydroPeak", "Solas", "Klassic", "Zenith", "Glacier"
  ];
  const adjectives = [
    "Double-Walled", "Vacuum-Insulated", "Copper-Coated", "Sleek Matte",
    "Ergonomic Sports", "Classic Metallic", "Polar Insulation", "Active-Flow",
    "Leak-Proof Travel", "Eco-Friendly Premium", "Tough Armor"
  ];
  const colors = [
    "Midnight Navy", "Crimson Red", "Matte Black", "Ocean Blue", "Sage Green",
    "Rose Gold", "Sunset Orange", "Charcoal Steel", "Blush Pink", "Champagne Gold"
  ];
  const itemTypes = [
    { type: "Water Bottle", minPrice: 399 },
    { type: "Vacuum Flask", minPrice: 599 },
    { type: "Thermal Shaker", minPrice: 499 },
    { type: "Insulated Lunchbox", minPrice: 799 }
  ];

  const brand = brands[hash % brands.length];
  const adj = adjectives[(hash + 3) % adjectives.length];
  const color = colors[(hash + 7) % colors.length];
  const itemTypeData = itemTypes[(hash + 11) % itemTypes.length];

  const title = `${brand} ${adj} ${color} ${itemTypeData.type}`;

  // Generate realistic prices between ₹399 and ₹1,199
  const price = itemTypeData.minPrice + (hash % 9) * 50; 
  const actualPrice = Math.floor(price * 1.35) + 49;

  const descriptions = [
    `Experience ultimate temperature control with the ${title}. Engineered with premium double-walled stainless steel to keep your drinks hot for 18 hours or cold for 24 hours. Features a durable, powder-coated exterior for a secure grip and leak-proof performance.`,
    `A sleek and reliable companion for your daily gym sessions, office hours, or outdoor adventures. This premium flask features advanced vacuum insulation and a copper lining for enhanced thermal retention.`,
    `Stay hydrated in style with this highly functional, ergonomically designed bottle. The premium matte finish and leak-proof cap combine style and utility, making it an eco-friendly choice for sustainable living.`,
    `Designed for active lifestyles, this high-performance insulated container keeps your food or beverages at the perfect temperature. The durable build resists dents and drops, ensuring a lifelong reliable performance.`
  ];

  const description = descriptions[hash % descriptions.length];

  return { title, name: title, description, price, actualPrice };
};

// Enrich products dynamically with specific overrides for bottles
const enrichProductData = (item, idx) => {
  const filename = item.filename || (item.image ? item.image.split("/").pop() : `IMG_${idx}.jpg`);

  // Vibrant Red Flask Specific Override
  if (filename.includes("152244307")) {
    return {
      name: "Vibrant Red Contoured Vacuum Flask",
      title: "Vibrant Red Contoured Vacuum Flask",
      description: "A vibrant red vacuum flask with a unique, ergonomic contoured shape. Designed for premium insulation to keep your beverages hot or cold for extended periods. This stylish bottle is both highly functional and visually appealing.",
      price: 300,
      actualPrice: 450
    };
  }

  // Copper Coated Bottle Specific Override
  if (filename.includes("152343358")) {
    return {
      name: "Asian Tuff Alfa Plus Copper-Coated Bottle",
      title: "Asian Tuff Alfa Plus Copper-Coated Bottle",
      description: "Asian Tuff Alfa Plus 500ml stainless steel vacuum bottle in a sleek matte black finish. It features an advanced copper coating for superior temperature retention, keeping drinks hot for up to 18 hours or cold for up to 24 hours.",
      price: 550,
      actualPrice: 750
    };
  }

  // Matte Black Bottle Specific Override
  if (filename.includes("152404257")) {
    return {
      name: "Minimalist Matte Black Stainless Bottle",
      title: "Minimalist Matte Black Stainless Bottle",
      description: "A minimalistic matte black stainless steel water bottle. Its double-walled insulated design and airtight metallic cap ensure your drinks stay at the perfect temperature throughout the day while offering a modern, sleek look.",
      price: 500,
      actualPrice: 700
    };
  }

  // Cello products — use name/description exactly as stored in products.json
  const isCello = filename.toLowerCase().startsWith("cello") || (item.image && item.image.includes("cello_prod"));
  if (isCello && item.name && !item.name.startsWith("Elegant Decor")) {
    return {
      name: item.name,
      title: item.name,
      description: item.description || `Premium ${item.name} by Cello — available at Ghar Sansar showroom.`,
      price: item.price || 499,
      actualPrice: item["act-price"] || item.price || 499
    };
  }

  // Check if this product is part of the 124 bottle products
  const isBottle = filename.startsWith("IMG_20250823") || (item.image && item.image.includes("23 evening")) || (item.category && item.category.includes("Decor"));
  if (isBottle) {
    const bottle = generateRealisticBottleProduct(filename, idx);
    return {
      name: bottle.title,
      title: bottle.title,
      description: bottle.description,
      price: bottle.price,
      actualPrice: bottle.actualPrice
    };
  }

  // Default fallback for standard decorative products (if any exist)
  const pricing = getPricesForProduct(item.name || item.title || "Elegant Product");
  const luxury = generateLuxuryProduct(filename, idx);

  return {
    name: item.name && !item.name.startsWith("Elegant Decor") ? item.name : luxury.name,
    title: item.title && !item.title.startsWith("Elegant Decor") ? item.title : luxury.name,
    description: item.description && !item.description.includes("Placeholder description") ? item.description : luxury.description,
    price: item.price || pricing.price,
    actualPrice: item["act-price"] || pricing.actualPrice
  };
};

// 1. Get Products (serves rewritten data with backend image URLs and realistic prices)
app.get("/api/products", (req, res) => {
  try {
    // Read the primary categorized products.json first
    let productsPath = path.join(__dirname, "public", "products.json");
    if (!fs.existsSync(productsPath)) {
      productsPath = path.join(__dirname, "public", "products", "23_evening_products.json");
    }

    if (!fs.existsSync(productsPath)) {
      return res.status(404).json({ error: "Product catalog not found" });
    }

    const rawData = readJsonFile(productsPath, []);
    
    // We rewrite the image paths to absolute backend URLs and add pricing if it is 0
    const processedData = rawData.map((category) => {
      let categoryName = category.name;
      if (categoryName === "23_evening") {
        categoryName = "Luxury Home Decor";
      }

      const subcategories = (category.subcategories || []).map((sub) => {
        let subName = sub.name;
        if (subName === "evening_collection") {
          subName = "Bespoke Artisanal Collection";
        }

        // Try 'images', 'products', or 'services'
        const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
        const items = sub[itemKey] || [];

        const updatedItems = items.map((item, idx) => {
          // If image path is local relative, make it absolute to our backend
          let imageUrl = item.image;
          if (imageUrl && imageUrl.startsWith("/")) {
            imageUrl = `http://localhost:${PORT}/products${imageUrl.replace(/^\/products/, "")}`;
          }

          // Enrich dynamically
          const enriched = enrichProductData(item, idx);

          return {
            ...item,
            name: enriched.name,
            title: enriched.title,
            description: enriched.description,
            image: imageUrl,
            price: enriched.price,
            "act-price": enriched.actualPrice
          };
        });

        return {
          ...sub,
          name: subName,
          [itemKey]: updatedItems
        };
      });

      return {
        ...category,
        name: categoryName,
        subcategories
      };
    });

    res.json(processedData);
  } catch (error) {
    console.error("Error loading products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. Authentication API
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const users = readJsonFile(USERS_FILE, []);
  
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: "User already exists with this email" });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone: phone || "",
    password, // In a real app we would hash this
    role: "user",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJsonFile(USERS_FILE, users);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ success: true, user: userWithoutPassword });
});

app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: "Missing login credentials" });
  }

  // Handle default admin
  if (emailOrPhone === "gharsansarshop@gmail.com" && (password === "GharStack@07" || password === "Gharstack@07")) {
    return res.json({
      success: true,
      user: {
        id: "admin_01",
        name: "Admin",
        email: "gharsansarshop@gmail.com",
        role: "admin"
      }
    });
  }

  const users = readJsonFile(USERS_FILE, []);
  const user = users.find(
    (u) => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email/phone or password" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.post("/api/auth/google", (req, res) => {
  const { email, name } = req.body;
  
  const googleEmail = email || "googleuser@example.com";
  const googleName = name || "Google User";

  const users = readJsonFile(USERS_FILE, []);
  let user = users.find((u) => u.email === googleEmail);

  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: googleName,
      email: googleEmail,
      role: "user",
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeJsonFile(USERS_FILE, users);
  }

  res.json({ success: true, user });
});

// 3. E-Commerce Orders API
app.get("/api/orders", (req, res) => {
  const userId = req.headers["user-id"];
  
  if (!userId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const orders = readJsonFile(ORDERS_FILE, []);
  
  // Admin gets all orders; user gets only their own
  if (userId === "admin_01") {
    res.json(orders);
  } else {
    const userOrders = orders.filter((o) => o.userId === userId);
    res.json(userOrders);
  }
});

app.post("/api/orders", (req, res) => {
  const userId = req.headers["user-id"];
  const { items, subtotal, shipping, tax, total, customer } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cannot create empty order" });
  }

  const orders = readJsonFile(ORDERS_FILE, []);

  const newOrder = {
    id: `ord_${Date.now()}`,
    orderNumber: `GS-${Math.floor(100000 + Math.random() * 900000)}`,
    userId,
    items,
    subtotal,
    shipping,
    tax,
    total,
    customer,
    status: "processing", // processing, shipped, delivered, cancelled
    paymentStatus: "paid",  // paid, pending, failed
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  res.status(201).json({ success: true, order: newOrder });
});

// ==========================================
// ADMIN DASHBOARD CRUD ENDPOINTS (PRODUCTS)
// ==========================================

// Ensure admin uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration for product uploads
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `admin_upload_${Date.now()}${ext}`);
  }
});
const productUpload = multer({ storage: productStorage });

// Admin: Get all products in categorized format (nested structure)
app.get("/api/storage/upload/products", (req, res) => {
  try {
    const productsPath = path.join(__dirname, "public", "products.json");
    if (!fs.existsSync(productsPath)) {
      return res.json({ data: [] });
    }
    const rawData = readJsonFile(productsPath, []);
    
    // Format data to match exactly what ProductsAdmin.tsx expects
    const formattedData = rawData.map((category, catIdx) => {
      let categoryName = category.name;
      if (categoryName === "23_evening") categoryName = "Luxury Home Decor";

      const subcategories = (category.subcategories || []).map((sub, subIdx) => {
        let subName = sub.name;
        if (subName === "evening_collection") subName = "Bespoke Artisanal Collection";

        const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
        const items = sub[itemKey] || [];

        const products = items.map((item, idx) => {
          const id = item.prod_id || item.id || `prod_${catIdx}_${subIdx}_${idx}`;
          
          let imageUrl = item.image || "";
          if (imageUrl && imageUrl.startsWith("/")) {
            imageUrl = `http://localhost:${PORT}/products${imageUrl.replace(/^\/products/, "")}`;
          }

          // Enrich dynamically
          const enriched = enrichProductData(item, idx);

          return {
            prod_id: id,
            id: id,
            title: enriched.title,
            description: enriched.description,
            price: enriched.price,
            actual_price: enriched.actualPrice,
            image: imageUrl,
            category: categoryName,
            subCategory: subName
          };
        });

        return {
          sub_id: `sub_${catIdx}_${subIdx}`,
          name: subName,
          products: products
        };
      });

      return {
        cat_id: `cat_${catIdx}`,
        name: categoryName,
        subcategories: subcategories
      };
    });

    res.json({ data: formattedData });
  } catch (error) {
    console.error("Admin products fetch error:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// Admin: Add new product or interior work (Multer upload)
app.post("/api/storage/upload", productUpload.single("image"), (req, res) => {
  try {
    const { category_type } = req.body;

    if (category_type === "interior") {
      const { category_name, subcategory_name, title, description } = req.body;
      const imagePath = req.file ? `/interior/${req.file.filename}` : null;

      const categoriesPath = path.join(__dirname, "public", "categories.json");
      const rawData = readJsonFile(categoriesPath, []);

      // Find or create category
      let category = rawData.find(c => c.name.toLowerCase() === category_name.toLowerCase());
      if (!category) {
        category = { 
          name: category_name, 
          image: imagePath || "/interior/placeholder.jpg", 
          subcategories: [], 
          features: ["Premium Service", "Professional Installation"] 
        };
        rawData.push(category);
      }

      // Check if updating an existing subcategory or adding a new one
      let subcategory = category.subcategories.find(s => s.name.toLowerCase() === subcategory_name.toLowerCase());
      if (subcategory) {
        // Update
        subcategory.name = title || subcategory.name;
        if (imagePath) subcategory.image = imagePath;
        if (description) subcategory.description = description;
      } else {
        // Add
        const newSub = {
          name: title || subcategory_name,
          image: imagePath || "/interior/placeholder.jpg",
          description: description || ""
        };
        category.subcategories.push(newSub);
      }

      fs.writeFileSync(categoriesPath, JSON.stringify(rawData, null, 2));
      return res.status(201).json({ success: true, message: "Interior work saved successfully" });
    }

    // Default product saving
    const { category_name, subcategory_name, title, price, actual_price, description } = req.body;
    const imagePath = req.file ? `/products/${req.file.filename}` : "/products/placeholder.jpg";

    const productsPath = path.join(__dirname, "public", "products.json");
    const rawData = readJsonFile(productsPath, []);

    // Find or create category
    let category = rawData.find(c => {
      const name = c.name === "23_evening" ? "Luxury Home Decor" : c.name;
      return name.toLowerCase() === category_name.toLowerCase();
    });
    if (!category) {
      category = { name: category_name, subcategories: [] };
      rawData.push(category);
    }

    // Find or create subcategory
    let subcategory = category.subcategories.find(s => {
      const name = s.name === "evening_collection" ? "Bespoke Artisanal Collection" : s.name;
      return name.toLowerCase() === subcategory_name.toLowerCase();
    });
    if (!subcategory) {
      subcategory = { name: subcategory_name, images: [] };
      category.subcategories.push(subcategory);
    }

    const itemKey = subcategory.images ? "images" : subcategory.products ? "products" : "images";
    if (!subcategory[itemKey]) subcategory[itemKey] = [];

    const newProdId = `prod_${Date.now()}`;
    const newProduct = {
      prod_id: newProdId,
      id: newProdId,
      name: title,
      title: title,
      price: parseInt(price) || 0,
      "act-price": parseInt(actual_price) || 0,
      description: description || "",
      image: imagePath
    };

    subcategory[itemKey].push(newProduct);
    fs.writeFileSync(productsPath, JSON.stringify(rawData, null, 2));

    res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Admin upload error:", error);
    res.status(500).json({ error: "Failed to process upload" });
  }
});

// Admin: Update product
app.put("/api/storage/upload/products", productUpload.single("image"), (req, res) => {
  try {
    const { id, title, price, actual_price, description, category_name, subcategory_name } = req.body;
    const imagePath = req.file ? `/products/${req.file.filename}` : null;
    const productsPath = path.join(__dirname, "public", "products.json");
    const rawData = readJsonFile(productsPath, []);

    let updated = false;

    for (let c of rawData) {
      for (let s of c.subcategories) {
        const itemKey = s.images ? "images" : s.products ? "products" : "images";
        const items = s[itemKey] || [];
        const idx = items.findIndex(item => (item.prod_id === id || item.id === id || item.name === id));
        if (idx !== -1) {
          items[idx] = {
            ...items[idx],
            name: title || items[idx].name,
            title: title || items[idx].title,
            price: price ? parseInt(price) : items[idx].price,
            "act-price": actual_price ? parseInt(actual_price) : items[idx]["act-price"],
            description: description || items[idx].description,
            image: imagePath || items[idx].image
          };
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (!updated) {
      return res.status(404).json({ error: "Product not found to update" });
    }

    fs.writeFileSync(productsPath, JSON.stringify(rawData, null, 2));
    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Admin product update error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Admin: Delete product
app.delete("/api/storage/uploads/products", (req, res) => {
  try {
    const { id } = req.query;
    const productsPath = path.join(__dirname, "public", "products.json");
    const rawData = readJsonFile(productsPath, []);

    let deleted = false;

    for (let c of rawData) {
      for (let s of c.subcategories) {
        const itemKey = s.images ? "images" : s.products ? "products" : "images";
        const items = s[itemKey] || [];
        const idx = items.findIndex(item => (item.prod_id === id || item.id === id || item.name === id));
        if (idx !== -1) {
          items.splice(idx, 1);
          deleted = true;
          break;
        }
      }
      if (deleted) break;
    }

    if (!deleted) {
      return res.status(404).json({ error: "Product not found to delete" });
    }

    fs.writeFileSync(productsPath, JSON.stringify(rawData, null, 2));
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Admin product delete error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Admin & Public: Fetch Interior Works
app.get("/api/storage/upload/interior", (req, res) => {
  try {
    const categoriesPath = path.join(__dirname, "public", "categories.json");
    const rawData = readJsonFile(categoriesPath, []);
    res.json({ success: true, data: rawData });
  } catch (error) {
    console.error("Fetch interior works error:", error);
    res.status(500).json({ error: "Failed to load interior works" });
  }
});

// Admin: Delete Interior Work
app.delete("/api/storage/upload/interior", (req, res) => {
  try {
    const { category_name, subcategory_name } = req.query;
    const categoriesPath = path.join(__dirname, "public", "categories.json");
    const rawData = readJsonFile(categoriesPath, []);

    let deleted = false;

    let category = rawData.find(c => c.name.toLowerCase() === category_name.toLowerCase());
    if (category && category.subcategories) {
      const idx = category.subcategories.findIndex(s => s.name.toLowerCase() === subcategory_name.toLowerCase());
      if (idx !== -1) {
        category.subcategories.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: "Interior work not found to delete" });
    }

    fs.writeFileSync(categoriesPath, JSON.stringify(rawData, null, 2));
    res.json({ success: true, message: "Interior work deleted successfully" });
  } catch (error) {
    console.error("Delete interior work error:", error);
    res.status(500).json({ error: "Failed to delete interior work" });
  }
});

// Orders: Get all orders
app.get("/api/orders", (req, res) => {
  try {
    const rawData = readJsonFile(ORDERS_FILE, []);
    res.json(rawData); // return directly as array to match frontend setOrders(res.data)
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// Orders: Place new order
app.post("/api/orders", (req, res) => {
  try {
    const rawData = readJsonFile(ORDERS_FILE, []);

    const { customer, items, subtotal, tax, total, paymentStatus, paymentId, paymentMethod } = req.body;

    const orderId = `GS-ORD-${Date.now().toString().slice(-6)}`;
    const orderNumber = `GS${Date.now().toString().slice(-8)}`;

    // Automatically calculate Shipping (Free over ₹1000, else ₹99)
    const calculatedSubtotal = parseFloat(subtotal) || 0;
    const calculatedShipping = calculatedSubtotal > 1000 ? 0 : 99;
    const calculatedTax = parseFloat(tax) || (calculatedSubtotal * 0.18);
    const grandTotal = calculatedSubtotal + calculatedShipping + calculatedTax;

    const newOrder = {
      id: orderId,
      orderNumber: orderNumber,
      timestamp: new Date().toISOString(),
      customer: customer || { email: "guest@example.com" },
      items: items || [],
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      total: grandTotal,
      status: "Processing",
      paymentStatus: paymentStatus || "paid",
      paymentId: paymentId || `pay_sim_${Date.now().toString().slice(-6)}`,
      paymentMethod: paymentMethod || "razorpay_dummy",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    rawData.unshift(newOrder); // Newest order on top
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(rawData, null, 2));

    // Auto-save customer data to customers.json
    if (customer && customer.email) {
      const customers = readJsonFile(CUSTOMERS_FILE, []);
      const existingIdx = customers.findIndex(c => c.email === customer.email);
      const customerRecord = {
        ...customer,
        lastOrderId: orderId,
        lastOrderDate: new Date().toISOString(),
        totalOrders: existingIdx >= 0 ? (customers[existingIdx].totalOrders || 0) + 1 : 1,
        totalSpent: existingIdx >= 0 ? ((customers[existingIdx].totalSpent || 0) + grandTotal) : grandTotal,
        savedAt: new Date().toISOString()
      };
      if (existingIdx >= 0) {
        customers[existingIdx] = customerRecord;
      } else {
        customers.unshift(customerRecord);
      }
      fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
      console.log(`👤 Customer saved: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    }

    // Clear console output to notify receiving order
    console.log("\n========================================================");
    console.log("📦 NEW E-COMMERCE ORDER RECEIVED!");
    console.log("--------------------------------------------------------");
    console.log(`Order ID    : ${newOrder.id}`);
    console.log(`Order No    : ${newOrder.orderNumber}`);
    console.log(`Date        : ${newOrder.timestamp}`);
    console.log(`Status      : ${newOrder.status}`);
    console.log("--------------------------------------------------------");
    console.log("👤 CUSTOMER DETAILS:");
    console.log(`Name        : ${newOrder.customer.firstName} ${newOrder.customer.lastName}`);
    console.log(`Email       : ${newOrder.customer.email}`);
    console.log(`Phone       : ${newOrder.customer.phone}`);
    console.log(`Shipping To : ${newOrder.customer.address}, ${newOrder.customer.city}, ${newOrder.customer.state} - ${newOrder.customer.zipCode}`);
    console.log("--------------------------------------------------------");
    console.log("🛍️ ITEMIZED ITEMS:");
    newOrder.items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.name} (x${item.quantity}) - ₹${item.price} each [Total: ₹${item.price * item.quantity}]`);
    });
    console.log("--------------------------------------------------------");
    console.log("💵 BILLING SUMMARY (AUTOMATIC RECEIPT):");
    console.log(`Subtotal    : ₹${newOrder.subtotal.toFixed(2)}`);
    console.log(`Shipping    : ₹${newOrder.shipping.toFixed(2)} (${newOrder.shipping === 0 ? 'FREE' : 'Standard'})`);
    console.log(`GST (18%)   : ₹${newOrder.tax.toFixed(2)}`);
    console.log(`GRAND TOTAL : ₹${newOrder.total.toFixed(2)}`);
    console.log("========================================================\n");

    res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ error: "Failed to process order" });
  }
});

// Orders: Toggle shipped status
app.patch("/api/orders/:id/shipped", (req, res) => {
  try {
    const { id } = req.params;
    const { shipped } = req.body; // boolean
    const orders = readJsonFile(ORDERS_FILE, []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return res.status(404).json({ error: "Order not found" });
    orders[idx].shipped = shipped;
    orders[idx].status = shipped ? "Shipped" : "Processing";
    orders[idx].shippedAt = shipped ? new Date().toISOString() : null;
    orders[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    console.log(`\n🚚 Order ${id} marked as ${shipped ? 'SHIPPED' : 'NOT SHIPPED'}`);
    res.json({ success: true, order: orders[idx] });
  } catch (error) {
    console.error("Shipped toggle error:", error);
    res.status(500).json({ error: "Failed to update shipped status" });
  }
});

// Customers: Get all stored customers
app.get("/api/customers", (req, res) => {
  try {
    const customers = readJsonFile(CUSTOMERS_FILE, []);
    res.json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ error: "Failed to load customers" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", port: PORT });
});

app.listen(PORT, () => {
  console.log(`Ghar Sansar backend server is running on http://localhost:${PORT}`);
});
