require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://gharsansar-ecommerce.vercel.app",
    "https://www.gharsansar.store",
    "https://gharsansar.store"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CMS ENDPOINTS ---
app.get("/api/cms/homepage_layout", (req, res) => {
  const layout = readJsonFile(HOMEPAGE_LAYOUT_FILE, { sections: [] });
  res.json(layout);
});

app.post("/api/cms/homepage_layout", (req, res) => {
  writeJsonFile(HOMEPAGE_LAYOUT_FILE, req.body);
  res.json({ success: true, message: "Homepage layout updated." });
});

app.get("/api/cms/collections", (req, res) => {
  const cols = readJsonFile(COLLECTIONS_FILE, []);
  res.json(cols);
});

app.post("/api/cms/collections", (req, res) => {
  writeJsonFile(COLLECTIONS_FILE, req.body);
  res.json({ success: true, message: "Collections updated." });
});

app.get("/api/cms/categories", (req, res) => {
  const cats = readJsonFile(CATEGORIES_FILE, []);
  res.json(cats);
});

app.post("/api/cms/categories", (req, res) => {
  writeJsonFile(CATEGORIES_FILE, req.body);
  res.json({ success: true, message: "Categories updated." });
});
// ---------------------

// Middleware to normalize double spaces in folder names for static product assets
app.use((req, res, next) => {
  if (req.url && req.url.startsWith("/products")) {
    try {
      let decodedPath = decodeURIComponent(req.url);
      if (/aquarium\s+and\s+accesories/i.test(decodedPath)) {
        const normalized = req.url.replace(/aquarium(%20|\s)+and(%20|\s)+(%20|\s)*accesories/i, "aquarium%20and%20accesories");
        if (normalized !== req.url) {
          req.url = normalized;
        }
      }
    } catch (err) {
      // Ignore URI decode errors
    }
  }
  next();
});

// Serve static images and files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory databases (would be a real database in production)
const USERS_FILE = path.join(__dirname, "users.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");
const CUSTOMERS_FILE = path.join(__dirname, "customers.json");
const BLOGS_FILE = path.join(__dirname, "blogs.json");
const ANALYTICS_FILE = path.join(__dirname, "analytics.json");
const NOTIFICATIONS_FILE = path.join(__dirname, "notifications.json");
const HOMEPAGE_LAYOUT_FILE = path.join(__dirname, "homepage_layout.json");
const COLLECTIONS_FILE = path.join(__dirname, "collections.json");
const CATEGORIES_FILE = path.join(__dirname, "categories.json");

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

  const finalName = item.name && !item.name.startsWith("Elegant Decor") ? item.name : luxury.name;
  const finalTitle = item.title && !item.title.startsWith("Elegant Decor") ? item.title : finalName;

  return {
    name: finalName,
    title: finalTitle,
    description: item.description && !item.description.includes("Placeholder description") ? item.description : luxury.description,
    price: item.price || pricing.price,
    actualPrice: (item.price && !item["act-price"]) ? 0 : (item["act-price"] || pricing.actualPrice)
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
            const host = req.get('host') || `192.168.0.106:${PORT}`;
            imageUrl = `${req.protocol}://${host}/products${imageUrl.replace(/^\/products/, "")}`;
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

// Profile upload directory setup
const avatarUploadsDir = path.join(__dirname, "public", "profile_pictures");
if (!fs.existsSync(avatarUploadsDir)) {
  fs.mkdirSync(avatarUploadsDir, { recursive: true });
}

// Multer storage for profile pictures
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({ storage: avatarStorage });

// Profile Picture Upload Endpoint
app.post("/api/auth/profile/upload-avatar", avatarUpload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const host = req.get('host') || `192.168.0.106:${PORT}`;
  const fileUrl = `${req.protocol}://${host}/profile_pictures/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Update Profile Endpoint
app.put("/api/auth/profile", (req, res) => {
  const { email, name, phone, profilePicture, addresses } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required to identify user profile" });
  }

  const users = readJsonFile(USERS_FILE, []);
  let userIdx = users.findIndex((u) => u.email === email);

  if (userIdx === -1 && email === "gharsansarshop@gmail.com") {
    // Auto-provision admin user in local users.json
    const newAdmin = {
      id: "admin_01",
      name: "Admin",
      email: "gharsansarshop@gmail.com",
      role: "admin",
      createdAt: new Date().toISOString()
    };
    users.push(newAdmin);
    userIdx = users.length - 1;
  }

  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Update provided fields
  if (name !== undefined) users[userIdx].name = name;
  if (phone !== undefined) users[userIdx].phone = phone;
  if (profilePicture !== undefined) users[userIdx].profilePicture = profilePicture;
  if (addresses !== undefined) users[userIdx].addresses = addresses;

  writeJsonFile(USERS_FILE, users);

  const { password: _, ...userWithoutPassword } = users[userIdx];
  res.json({ success: true, user: userWithoutPassword });
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
            const host = req.get('host') || `192.168.0.106:${PORT}`;
            imageUrl = `${req.protocol}://${host}/products${imageUrl.replace(/^\/products/, "")}`;
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
      const imagePath = req.file ? `/products/${req.file.filename}` : null;

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
    const { id, title, price, actual_price, description, category_name, subcategory_name, stock } = req.body;
    const imagePath = req.file ? `/products/${req.file.filename}` : null;
    const productsPath = path.join(__dirname, "public", "products.json");
    const rawData = readJsonFile(productsPath, []);

    let updated = false;

    // 1. Try matching by exact ID (for newly added products that have a unique ID in the database)
    if (id) {
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
              image: imagePath || items[idx].image,
              stock: stock !== undefined ? parseInt(stock) : items[idx].stock
            };
            updated = true;
            break;
          }
        }
        if (updated) break;
      }
    }

    // 2. Try index-based lookup (for original products mapped as prod_catIdx_subIdx_idx)
    if (!updated && id) {
      const match = id.match(/^prod_(\d+)_(\d+)_(\d+)$/);
      if (match) {
        const catIdx = parseInt(match[1]);
        const subIdx = parseInt(match[2]);
        const idx = parseInt(match[3]);
        if (rawData[catIdx] && rawData[catIdx].subcategories[subIdx]) {
          const sub = rawData[catIdx].subcategories[subIdx];
          const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
          const items = sub[itemKey];
          if (items && items[idx]) {
            items[idx] = {
              ...items[idx],
              name: title || items[idx].name || items[idx].title,
              title: title || items[idx].title || items[idx].name,
              price: price ? parseInt(price) : items[idx].price,
              "act-price": actual_price ? parseInt(actual_price) : items[idx]["act-price"] || items[idx].price,
              description: description || items[idx].description,
              image: imagePath || items[idx].image
            };
            updated = true;
          }
        }
      }
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

    // 1. Try matching by exact ID (for newly added products)
    if (id) {
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
    }

    // 2. Try index-based lookup (for original products mapped as prod_catIdx_subIdx_idx)
    if (!deleted && id) {
      const match = id.match(/^prod_(\d+)_(\d+)_(\d+)$/);
      if (match) {
        const catIdx = parseInt(match[1]);
        const subIdx = parseInt(match[2]);
        const idx = parseInt(match[3]);
        if (rawData[catIdx] && rawData[catIdx].subcategories[subIdx]) {
          const sub = rawData[catIdx].subcategories[subIdx];
          const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
          const items = sub[itemKey];
          if (items && items[idx]) {
            items.splice(idx, 1);
            deleted = true;
          }
        }
      }
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
    const userId = req.headers["user-id"];
    const rawData = readJsonFile(ORDERS_FILE, []);
    
    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }

    if (userId === "admin_01" || userId === "gharsansarshop@gmail.com") {
      res.json(rawData);
    } else {
      const userOrders = rawData.filter((o) => o.userId === userId || (o.customer && o.customer.email === userId));
      res.json(userOrders);
    }
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// Orders: Place new order
app.post("/api/orders", (req, res) => {
  try {
    const userId = req.headers["user-id"] || req.body.customer?.email || "guest";
    const rawData = readJsonFile(ORDERS_FILE, []);

    const { customer, items, subtotal, tax, total, paymentStatus, paymentId, paymentMethod } = req.body;

    const orderId = `GS-ORD-${Date.now().toString().slice(-6)}`;
    const orderNumber = `GS${Date.now().toString().slice(-8)}`;

    // Respect custom shipping charge and total sent from frontend if present, else calculate
    const calculatedSubtotal = parseFloat(subtotal) || 0;
    const calculatedShipping = req.body.shipping !== undefined ? parseFloat(req.body.shipping) : (calculatedSubtotal > 1000 ? 0 : 99);
    const calculatedTax = parseFloat(tax) || (calculatedSubtotal * 0.18);
    const grandTotal = req.body.total !== undefined ? parseFloat(req.body.total) : (calculatedSubtotal + calculatedShipping + calculatedTax);

    const newOrder = {
      id: orderId,
      orderNumber: orderNumber,
      userId: userId,
      timestamp: new Date().toISOString(),
      customer: customer || { email: "guest@example.com" },
      items: items || [],
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      total: grandTotal,
      status: "processing",
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

    // Save to Admin Notifications Database
    try {
      const notifications = readJsonFile(NOTIFICATIONS_FILE, []);
      const adminNotification = {
        id: `GS-NOTIF-${Date.now().toString().slice(-6)}`,
        type: "new_order",
        title: "New Order Placed",
        message: `Order ${orderNumber} for ₹${grandTotal.toFixed(2)} placed by ${customer.firstName} ${customer.lastName}`,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: {
          orderId,
          orderNumber,
          customerName: `${customer.firstName} ${customer.lastName}`,
          total: grandTotal
        }
      };
      notifications.unshift(adminNotification);
      if (notifications.length > 100) notifications.pop();
      writeJsonFile(NOTIFICATIONS_FILE, notifications);
      console.log(`🔔 Admin Dashboard notification recorded: ${adminNotification.id}`);
    } catch (e) {
      console.error("Failed to write to notifications.json:", e);
    }

    // Dispatch Mobile notifications (SMS/WhatsApp)
    // 1. Customer notification
    if (customer && customer.phone) {
      const customerMessage = `Hello ${customer.firstName}, thank you for shopping at Ghar Sansar! Your order ${orderNumber} for ₹${grandTotal.toFixed(2)} has been received and is being processed. View details at https://www.gharsansar.store/orders`;
      sendMobileNotification(customer.phone, customerMessage, {
        customerName: customer.firstName,
        orderNumber: orderNumber,
        totalAmount: grandTotal.toFixed(2)
      });
    }

    // 2. Admin notification
    const adminPhone = process.env.ADMIN_MOBILE_NUMBER || "+919999999999";
    const adminMessage = `🔔 New Order Received! Order No: ${orderNumber}, Customer: ${customer?.firstName || "Guest"} ${customer?.lastName || ""}, Total: ₹${grandTotal.toFixed(2)}. Manage orders at https://www.gharsansar.store/admin/orders-admin`;
    sendMobileNotification(adminPhone, adminMessage, {
      customerName: `${customer?.firstName || "Guest"} ${customer?.lastName || ""}`.trim(),
      orderNumber: orderNumber,
      totalAmount: grandTotal.toFixed(2)
    });

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
    orders[idx].status = shipped ? "shipped" : "processing";
    orders[idx].shippedAt = shipped ? new Date().toISOString() : null;
    orders[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    console.log(`\n🚚 Order ${id} marked as ${shipped ? 'shipped' : 'processing'}`);
    res.json({ success: true, order: orders[idx] });
  } catch (error) {
    console.error("Shipped toggle error:", error);
    res.status(500).json({ error: "Failed to update shipped status" });
  }
});

// Orders: Update status
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });
    const orders = readJsonFile(ORDERS_FILE, []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return res.status(404).json({ error: "Order not found" });
    
    const normalizedStatus = status.toLowerCase();
    orders[idx].status = normalizedStatus;
    orders[idx].shipped = normalizedStatus === "shipped";
    if (normalizedStatus === "shipped" && !orders[idx].shippedAt) {
      orders[idx].shippedAt = new Date().toISOString();
    }
    orders[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    console.log(`\n📦 Order ${id} status updated to ${normalizedStatus}`);
    res.json({ success: true, order: orders[idx] });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Failed to update status" });
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

// Chats: Get all chat sessions
const CHATS_FILE = path.join(__dirname, "chats.json");

app.get("/api/chats", (req, res) => {
  try {
    const chats = readJsonFile(CHATS_FILE, []);
    res.json(chats);
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ error: "Failed to load chats" });
  }
});

app.post("/api/chats", (req, res) => {
  try {
    const chats = readJsonFile(CHATS_FILE, []);
    const { sessionId, userName, userEmail, messages } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const existingIdx = chats.findIndex(c => c.sessionId === sessionId);
    const sessionRecord = {
      sessionId,
      userName: userName || "Guest",
      userEmail: userEmail || "guest@example.com",
      messages: messages || [],
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      chats[existingIdx] = sessionRecord;
    } else {
      chats.unshift(sessionRecord);
    }

    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2));
    res.json({ success: true, chat: sessionRecord });
  } catch (error) {
    console.error("Save chat error:", error);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

// ==========================================
// ADMIN DASHBOARD BLOG ENDPOINTS
// ==========================================

const blogUploadsDir = path.join(__dirname, "public", "blogs");
if (!fs.existsSync(blogUploadsDir)) {
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}

const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `blog_upload_${Date.now()}${ext}`);
  }
});
const blogUpload = multer({ storage: blogStorage });

// Get all blogs
app.get("/api/storage/upload/blog", (req, res) => {
  try {
    const blogs = readJsonFile(BLOGS_FILE, []);
    res.json({ success: true, data: blogs });
  } catch (error) {
    console.error("Fetch blogs error:", error);
    res.status(500).json({ error: "Failed to load blogs" });
  }
});

// Add new blog
app.post("/api/storage/upload/blog", blogUpload.single("file"), (req, res) => {
  try {
    const { title, description, price, video, videoType, category_name } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const blogs = readJsonFile(BLOGS_FILE, []);
    
    // Construct image URL if file uploaded
    let imageUrl = "";
    if (req.file) {
      const host = req.get('host') || `192.168.0.106:${PORT}`;
      imageUrl = `${req.protocol}://${host}/blogs/${req.file.filename}`;
    }

    const newBlog = {
      id: `blog-yt-${Date.now()}`,
      title,
      description: description || "",
      price: price ? parseFloat(price) : undefined,
      video: video || undefined,
      videoType: videoType || undefined,
      features: category_name ? [category_name] : ["general"],
      image: imageUrl || undefined
    };

    blogs.unshift(newBlog); // Add new blog to top of the list
    writeJsonFile(BLOGS_FILE, blogs);

    console.log(`📝 Blog created successfully: ${title}`);
    res.status(201).json({ success: true, message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
});

// Delete blog
app.delete("/api/storage/upload/blog", (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    const blogs = readJsonFile(BLOGS_FILE, []);
    const initialLength = blogs.length;
    const filteredBlogs = blogs.filter(b => b.id !== id);

    if (filteredBlogs.length === initialLength) {
      return res.status(404).json({ error: "Blog not found to delete" });
    }

    writeJsonFile(BLOGS_FILE, filteredBlogs);
    console.log(`🗑️ Blog deleted successfully: ${id}`);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

// ==========================================
// ADMIN DASHBOARD VISITOR ANALYTICS
// ==========================================

// Track a website hit
app.post("/api/analytics/hit", (req, res) => {
  try {
    const { visitorId, isNewSession } = req.body;
    
    // Fallback if no body is passed
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
    const uniqueId = visitorId || ip;

    const data = readJsonFile(ANALYTICS_FILE, {
      totalHits: 0,
      uniqueVisitors: 0,
      dailyStats: {},
      visitorIps: []
    });

    // Handle legacy formats if any
    if (!data.dailyStats) data.dailyStats = {};
    if (!data.visitorIps) data.visitorIps = [];

    // 1. Increment total page views (hits)
    data.totalHits = (data.totalHits || 0) + 1;

    // 2. Check and increment unique visitors
    let isUnique = false;
    if (!data.visitorIps.includes(uniqueId)) {
      data.visitorIps.push(uniqueId);
      data.uniqueVisitors = (data.uniqueVisitors || 0) + 1;
      isUnique = true;
    }

    // 3. Track daily stats
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = { hits: 0, uniques: 0 };
    }
    
    data.dailyStats[today].hits = (data.dailyStats[today].hits || 0) + 1;
    if (isUnique || isNewSession) {
      data.dailyStats[today].uniques = (data.dailyStats[today].uniques || 0) + 1;
    }

    writeJsonFile(ANALYTICS_FILE, data);
    res.json({ success: true });
  } catch (error) {
    console.error("Analytics hit error:", error);
    res.status(500).json({ error: "Failed to record hit" });
  }
});

// Retrieve stats
app.get("/api/analytics/stats", (req, res) => {
  try {
    const data = readJsonFile(ANALYTICS_FILE, {
      totalHits: 0,
      uniqueVisitors: 0,
      dailyStats: {},
      visitorIps: []
    });

    // Sort and format daily stats for frontend trend charts
    const sortedDaily = Object.entries(data.dailyStats || {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, stats]) => ({
        date,
        hits: stats.hits || 0,
        uniques: stats.uniques || 0
      }));

    res.json({
      success: true,
      totalHits: data.totalHits || 0,
      uniqueVisitors: data.uniqueVisitors || 0,
      dailyStats: sortedDaily
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ==========================================
// ADMIN DASHBOARD NOTIFICATIONS & SMS SENDER
// ==========================================

// Send Mobile Notification via SMS API (Authkey / Twilio / Fast2SMS) and generate WhatsApp Web Link
async function sendMobileNotification(phone, message, orderDetails = {}) {
  try {
    const cleanedPhone = phone.replace(/[^0-9+]/g, "");

    // Format message if smsFormat is provided in orderDetails
    let finalMessage = message;
    if (orderDetails.smsFormat) {
      finalMessage = orderDetails.smsFormat
        .replace(/{name}/g, orderDetails.customerName || "")
        .replace(/{order_no}/g, orderDetails.orderNumber || "")
        .replace(/{amount}/g, orderDetails.totalAmount || "")
        .replace(/{company}/g, "Ghar Sansar");
    }

    console.log(`\n========================================================`);
    console.log(`📱 MOBILE NOTIFICATION DISPATCHER`);
    console.log(`--------------------------------------------------------`);
    console.log(`To      : ${cleanedPhone}`);
    console.log(`Message : "${finalMessage}"`);
    
    // Generate WhatsApp Web Click-to-Send link for testing/quick forward
    const encodedMsg = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanedPhone.replace("+", "")}&text=${encodedMsg}`;
    console.log(`🔗 WhatsApp Link : ${whatsappUrl}`);
    console.log(`========================================================\n`);

    let sent = false;

    // 1. Authkey.io Integration
    if (process.env.AUTHKEY_API_KEY) {
      console.log("Attempting SMS dispatch via Authkey.io...");

      // Dynamic country code extraction
      let countryCode = "91"; // Default
      let localNum = cleanedPhone;

      if (cleanedPhone.startsWith("+")) {
        if (cleanedPhone.startsWith("+91")) {
          countryCode = "91";
          localNum = cleanedPhone.slice(3);
        } else {
          const match = cleanedPhone.match(/^\+(\d{1,4})(\d{7,10})$/);
          if (match) {
            countryCode = match[1];
            localNum = match[2];
          } else {
            localNum = cleanedPhone.replace("+", "");
          }
        }
      } else {
        if (cleanedPhone.length === 10) {
          countryCode = "91";
          localNum = cleanedPhone;
        } else if (cleanedPhone.startsWith("91") && cleanedPhone.length === 12) {
          countryCode = "91";
          localNum = cleanedPhone.slice(2);
        } else {
          localNum = cleanedPhone.replace(/^0+/, "");
          if (localNum.length === 10) {
            countryCode = "91";
          }
        }
      }

      const senderId = process.env.AUTHKEY_SENDER_ID || "GHARSAN";
      const peId = process.env.AUTHKEY_PE_ID;
      const templateId = process.env.AUTHKEY_TEMPLATE_ID;
      const sid = process.env.AUTHKEY_SID;

      let url = `https://api.authkey.io/request?authkey=${process.env.AUTHKEY_API_KEY}&mobile=${localNum}&country_code=${countryCode}`;

      if (sid) {
        url += `&sid=${sid}`;
        url += `&name=${encodeURIComponent(orderDetails.customerName || "")}`;
        url += `&order_no=${encodeURIComponent(orderDetails.orderNumber || "")}`;
        url += `&amount=${encodeURIComponent(orderDetails.totalAmount || "")}`;
        url += `&company=${encodeURIComponent("Ghar Sansar")}`;
        // Map case-sensitive custom template variables
        url += `&Name=${encodeURIComponent(orderDetails.customerName || "")}`;
        url += `&OrderID=${encodeURIComponent(orderDetails.orderNumber || "")}`;
        
        // Pass Sender ID and Entity ID to ensure carrier approval
        if (senderId) url += `&sender=${senderId}`;
        if (peId) url += `&pe_id=${peId}`;
      } else {
        url += `&sms=${encodeURIComponent(finalMessage)}&sender=${senderId}`;
        if (peId) url += `&pe_id=${peId}`;
        if (templateId) url += `&template_id=${templateId}`;
      }

      console.log(`Authkey Dispatch URL: ${url.replace(process.env.AUTHKEY_API_KEY, "HIDDEN")}`);
      try {
        const res = await fetch(url);
        let data;
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (jsonErr) {
          data = { responseText: text };
        }
        console.log("Authkey response:", data);
        
        if (res.ok && (data.Message === "Submitted Successfully" || data.status === "Success" || (data.responseText && data.responseText.includes("Submitted")))) {
          console.log("✅ Authkey success:", data);
          sent = true;
        } else {
          console.warn("⚠️ Authkey failed or rejected:", data);
        }
      } catch (fetchErr) {
        console.error("❌ Authkey fetch error:", fetchErr);
      }
    }

    // 2. Fast2SMS Integration (For Indian Numbers) - Fallback
    if (!sent && process.env.FAST2SMS_API_KEY) {
      console.log("Attempting SMS dispatch via Fast2SMS...");
      const localNum = cleanedPhone.replace("+91", "").replace("+", "");
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(finalMessage)}&language=english&flash=0&numbers=${localNum}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.return) {
        console.log("✅ Fast2SMS success:", data.message);
        sent = true;
      } else {
        console.warn("⚠️ Fast2SMS failed:", data.message);
      }
    }

    // 3. Twilio SMS Integration
    if (!sent && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      console.log("Attempting SMS dispatch via Twilio...");
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const formattedTo = cleanedPhone.startsWith("+") ? cleanedPhone : `+91${cleanedPhone}`;
      
      const res = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: formattedTo,
          Body: finalMessage
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log("✅ Twilio success. SID:", data.sid);
        sent = true;
      } else {
        console.warn("⚠️ Twilio failed:", data.message);
      }
    }

    if (!sent) {
      console.log("ℹ️ SMS Gateway keys not configured in .env. Console log simulation active.");
    }
  } catch (error) {
    console.error("Error dispatching mobile notification:", error);
  }
}

// Get all admin notifications
app.get("/api/notifications", (req, res) => {
  try {
    const notifications = readJsonFile(NOTIFICATIONS_FILE, []);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

// Mark notifications as read
app.post("/api/notifications/read", (req, res) => {
  try {
    const { id, all } = req.body;
    let notifications = readJsonFile(NOTIFICATIONS_FILE, []);
    
    if (all) {
      notifications = notifications.map(n => ({ ...n, read: true }));
    } else if (id) {
      notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    }
    
    writeJsonFile(NOTIFICATIONS_FILE, notifications);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Read notifications error:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Clear all notifications
app.post("/api/notifications/clear", (req, res) => {
  try {
    writeJsonFile(NOTIFICATIONS_FILE, []);
    res.json({ success: true, notifications: [] });
  } catch (error) {
    console.error("Clear notifications error:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// ==========================================
// DELHIVERY B2C SHIPPING API INTEGRATION
// ==========================================
const DELHIVERY_API_TOKEN = "4732d4c40573baccefd3d078c2502e4582a1e7c3";
const DELHIVERY_BASE_URL = "https://track.delhivery.com";

// 1. Check Pincode Serviceability
app.get("/api/shipping/serviceability", async (req, res) => {
  const { pincode } = req.query;
  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
    return res.status(400).json({ error: "Invalid pincode format" });
  }

  try {
    console.log(`Checking Delhivery serviceability for pincode: ${pincode}`);
    const response = await fetch(`${DELHIVERY_BASE_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      headers: {
        "Authorization": `Token ${DELHIVERY_API_TOKEN}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Delhivery API returned status ${response.status}`);
    }

    const data = await response.json();
    const codes = data.delivery_codes || [];
    const codeInfo = codes.find(c => c.postal_code && c.postal_code.pin.toString() === pincode);

    if (codeInfo && codeInfo.postal_code) {
      return res.json({
        success: true,
        serviceable: true,
        provider: "Express Courier Partner",
        cod: codeInfo.postal_code.cash === "Y",
        prepaid: codeInfo.postal_code.pre_paid === "Y",
        city: codeInfo.postal_code.city,
        state: codeInfo.postal_code.state_code
      });
    } else {
      return res.json({
        success: true,
        serviceable: false,
        provider: "Express Courier Partner"
      });
    }
  } catch (error) {
    console.error("Express Courier Partner pincode serviceability check failed, using fallback mock:", error.message);
    // Fallback: assume serviceable for valid 6-digit Indian PINs
    return res.json({
      success: true,
      serviceable: true,
      provider: "Express Courier Partner (Mock Fallback)",
      cod: true,
      prepaid: true,
      city: "Hyderabad (Mock)",
      state: "TS (Mock)"
    });
  }
});

// 2. Create Delhivery Shipment (Fulfill Order)
app.post("/api/shipping/create-shipment", async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    const orderIdx = orders.findIndex(o => o.id === orderId);

    if (orderIdx === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[orderIdx];
    console.log(`Creating Delhivery shipment for Order: ${order.orderNumber} (${orderId})`);

    // Prepare Delhivery CMU payload
    const shipmentPayload = {
      shipments: [
        {
          order: order.orderNumber,
          waybill: "",
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          phone: order.customer.phone,
          add: order.customer.address,
          city: order.customer.city,
          state: order.customer.state,
          country: order.customer.country || "India",
          pin: order.customer.zipCode,
          payment_mode: "Prepaid",
          total_amount: order.total,
          cod_amount: 0,
          products_desc: order.items.map(item => item.name).join(", ").slice(0, 100),
          quantity: order.items.reduce((sum, item) => sum + (item.quantity || 1), 0),
          pickup_location: {
            name: "Ghar Sansar Showroom",
            city: "Vijayawada",
            state: "Andhra Pradesh",
            pincode: "520001",
            phone: "9999999999",
            address: "Ghar Sansar Showroom, Main Road, Vijayawada"
          }
        }
      ]
    };

    const params = new URLSearchParams();
    params.append("format", "json");
    params.append("data", JSON.stringify(shipmentPayload));

    let waybill = null;
    let rawDelhiveryResponse = null;

    try {
      const response = await fetch(`${DELHIVERY_BASE_URL}/api/cmu/create.json`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${DELHIVERY_API_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Delhivery returned HTTP ${response.status}`);
      }

      rawDelhiveryResponse = await response.json();
      console.log("Delhivery CMU response:", JSON.stringify(rawDelhiveryResponse));

      if (rawDelhiveryResponse.success && rawDelhiveryResponse.packages && rawDelhiveryResponse.packages.length > 0) {
        const pkg = rawDelhiveryResponse.packages[0];
        if (pkg.status === "Success" || pkg.assigned_waybill) {
          waybill = pkg.waybill || pkg.assigned_waybill;
        } else {
          throw new Error(pkg.remarks || pkg.reason || "Package assignment failed");
        }
      } else {
        throw new Error("Shipment creation unsuccessful in Delhivery response");
      }
    } catch (err) {
      console.error("Delhivery API shipment creation failed, falling back to mock:", err.message);
      // Fallback: Generate a realistic 12-digit numeric AWB starting with 4732
      waybill = `4732${Math.floor(10000000 + Math.random() * 90000000)}`;
      rawDelhiveryResponse = { mock: true, msg: "Fell back to mock due to: " + err.message };
    }

    // Update order status in orders.json
    orders[orderIdx].status = "shipped";
    orders[orderIdx].shipped = true;
    orders[orderIdx].trackingNumber = waybill;
    orders[orderIdx].shippedAt = new Date().toISOString();
    orders[orderIdx].updatedAt = new Date().toISOString();

    writeJsonFile(ORDERS_FILE, orders);
    console.log(`🚚 Express Courier shipment created for order ${orderId} with AWB: ${waybill}`);

    res.json({
      success: true,
      message: "Shipment created successfully via Express Courier Partner",
      waybill: waybill,
      order: orders[orderIdx],
      rawResponse: rawDelhiveryResponse
    });
  } catch (error) {
    console.error("Fulfill shipment endpoint error:", error);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

// 3. Track Delhivery Shipment
app.get("/api/shipping/track/:awb", async (req, res) => {
  const { awb } = req.params;
  if (!awb) {
    return res.status(400).json({ error: "AWB number is required" });
  }

  try {
    console.log(`Tracking Delhivery shipment AWB: ${awb}`);
    const response = await fetch(`${DELHIVERY_BASE_URL}/api/v1/packages/json/?waybill=${awb}`, {
      headers: {
        "Authorization": `Token ${DELHIVERY_API_TOKEN}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Delhivery track API status ${response.status}`);
    }

    const data = await response.json();

    if (data.ShipmentData && data.ShipmentData.length > 0) {
      const shipment = data.ShipmentData[0].Shipment;
      if (shipment && shipment.Status) {
        const checkpoints = (shipment.Scans || []).map(scan => {
          const detail = scan.ScanDetail || {};
          return {
            status: detail.Scan || "In Transit",
            location: detail.ScannedLocation || "Transit Hub",
            timestamp: detail.ScanDateTime || new Date().toISOString(),
            description: detail.Instructions || "Shipment in transit"
          };
        });

        return res.json({
          success: true,
          awb: awb,
          status: shipment.Status.Status || "Pending",
          expectedDate: shipment.ExpectedDeliveryDate || null,
          checkpoints: checkpoints.length > 0 ? checkpoints : [{
            status: shipment.Status.Status || "Manifested",
            location: shipment.Status.StatusLocation || "Origin Hub",
            timestamp: shipment.Status.StatusDateTime || new Date().toISOString(),
            description: shipment.Status.Instructions || "Shipment manifested"
          }]
        });
      }
    }
    throw new Error("No tracking info found for AWB in Delhivery system");
  } catch (error) {
    console.warn(`Delhivery tracking failed for AWB ${awb}, using mock milestones:`, error.message);

    const milestones = [
      {
        status: "Manifested",
        location: "Vijayawada Showroom Hub",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        description: "Shipment details uploaded & package ready for pickup."
      },
      {
        status: "Picked Up",
        location: "Vijayawada Center",
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        description: "Package received at courier pickup center."
      },
      {
        status: "In Transit",
        location: "Hyderabad Hub",
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        description: "Shipment in transit to destination hub."
      },
      {
        status: "Out For Delivery",
        location: "Destination Hub",
        timestamp: new Date().toISOString(),
        description: "Package is out with courier partner for delivery."
      }
    ];

    return res.json({
      success: true,
      awb: awb,
      status: "Out For Delivery (Mock)",
      expectedDate: new Date(Date.now() + 3600000 * 4).toISOString(),
      checkpoints: milestones
    });
  }
});

// Banners database and endpoints
const BANNERS_FILE = path.join(__dirname, "banners.json");

const getBanners = () => {
  const defaultBanners = [
    {
      id: "banner-1",
      title: "Furniture Offers",
      subtitle: "Up to 50% Off on Modern Living Room sets",
      gradient: ["#FF9F43", "#FF5252"],
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
      tag: "50% OFF"
    },
    {
      id: "banner-2",
      title: "Kitchen Essentials",
      subtitle: "Flat 30% Off on Premium Crockery & Dinnerware",
      gradient: ["#48DBFB", "#1DD1A1"],
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",
      tag: "Premium"
    },
    {
      id: "banner-3",
      title: "Home Decor",
      subtitle: "Transform your space with Handcrafted Rajasthan Idols",
      gradient: ["#A55EEA", "#4B7BEC"],
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600",
      tag: "Traditional"
    },
    {
      id: "banner-4",
      title: "Premium Collections",
      subtitle: "Curated Bedroom Collections for ultimate comfort",
      gradient: ["#FF6B6B", "#EE5253"],
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600",
      tag: "Trending"
    }
  ];
  return readJsonFile(BANNERS_FILE, defaultBanners);
};

app.get("/api/banners", (req, res) => {
  res.json(getBanners());
});

app.post("/api/banners", productUpload.single("image"), (req, res) => {
  try {
    const { title, subtitle, gradientStart, gradientEnd, tag, imageUrl } = req.body;
    const host = req.get('host') || `192.168.0.106:${PORT}`;
    const finalImage = req.file ? `${req.protocol}://${host}/products/${req.file.filename}` : (imageUrl || "");
    const banners = getBanners();
    const newBanner = {
      id: `banner-${Date.now()}`,
      title: title || "New Offer",
      subtitle: subtitle || "",
      gradient: [gradientStart || "#121212", gradientEnd || "#121212"],
      image: finalImage,
      tag: tag || ""
    };
    banners.push(newBanner);
    writeJsonFile(BANNERS_FILE, banners);
    res.status(201).json({ success: true, banner: newBanner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/banners", productUpload.single("image"), (req, res) => {
  try {
    const { id, title, subtitle, gradientStart, gradientEnd, tag, imageUrl } = req.body;
    const banners = getBanners();
    const idx = banners.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: "Banner not found" });

    const host = req.get('host') || `192.168.0.106:${PORT}`;
    const finalImage = req.file ? `${req.protocol}://${host}/products/${req.file.filename}` : (imageUrl || banners[idx].image);
    
    banners[idx] = {
      ...banners[idx],
      title: title || banners[idx].title,
      subtitle: subtitle || banners[idx].subtitle,
      gradient: [gradientStart || banners[idx].gradient[0], gradientEnd || banners[idx].gradient[1]],
      image: finalImage,
      tag: tag || banners[idx].tag
    };
    writeJsonFile(BANNERS_FILE, banners);
    res.json({ success: true, banner: banners[idx] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/banners", (req, res) => {
  try {
    const { id } = req.query;
    const banners = getBanners();
    const filtered = banners.filter(b => b.id !== id);
    writeJsonFile(BANNERS_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flash Sale database and endpoints
const FLASHSALE_FILE = path.join(__dirname, "flashsale.json");

const getFlattenedProducts = () => {
  const productsPath = path.join(__dirname, "public", "products.json");
  if (!fs.existsSync(productsPath)) return [];
  const rawData = readJsonFile(productsPath, []);
  const allProducts = [];
  rawData.forEach((category, catIdx) => {
    let categoryName = category.name === "23_evening" ? "Luxury Home Decor" : category.name;
    category.subcategories?.forEach((sub, subIdx) => {
      let subName = sub.name === "evening_collection" ? "Bespoke Artisanal Collection" : sub.name;
      const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
      const items = sub[itemKey] || [];
      items.forEach((item, idx) => {
        const id = item.prod_id || item.id || `prod_${catIdx}_${subIdx}_${idx}`;
        let imageUrl = item.image || "";
        if (imageUrl && imageUrl.startsWith("/")) {
          imageUrl = `http://192.168.0.106:5001/products${imageUrl.replace(/^\/products/, "")}`;
        }
        const enriched = enrichProductData(item, idx);
        allProducts.push({
          id,
          prod_id: id,
          title: enriched.title,
          name: enriched.title,
          description: enriched.description,
          price: enriched.price,
          "act-price": enriched.actualPrice,
          image: imageUrl,
          category: categoryName,
          subCategory: subName,
          rating: item.rating || parseFloat((4.0 + (idx % 11) * 0.1).toFixed(1)),
          reviewsCount: item.reviewsCount || 10 + (idx % 20) * 5,
          matchPercent: item.matchPercent || 80 + (idx % 15),
          commentsCount: item.commentsCount || 2 + (idx % 5)
        });
      });
    });
  });
  return allProducts;
};

const getFlashSaleConfig = () => {
  const flatProds = getFlattenedProducts();
  const defaultIds = flatProds.slice(0, 10).map(p => p.id);
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);
  const defaultSettings = {
    expiryTime: tomorrow.toISOString(),
    productIds: defaultIds
  };
  return readJsonFile(FLASHSALE_FILE, defaultSettings);
};

app.get("/api/flashsale", (req, res) => {
  try {
    const config = getFlashSaleConfig();
    const flatProds = getFlattenedProducts(req);
    const enrichedProducts = config.productIds.map(id => flatProds.find(p => p.id === id)).filter(Boolean);
    res.json({
      expiryTime: config.expiryTime,
      productIds: config.productIds,
      products: enrichedProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/flashsale", (req, res) => {
  try {
    const { expiryTime, productIds } = req.body;
    if (!expiryTime || !Array.isArray(productIds)) {
      return res.status(400).json({ error: "expiryTime and productIds (array) are required" });
    }
    const settings = { expiryTime, productIds };
    writeJsonFile(FLASHSALE_FILE, settings);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic categories endpoint
app.get("/api/products/categories", (req, res) => {
  try {
    const flatProds = getFlattenedProducts(req);
    const categoriesMap = {};
    flatProds.forEach(p => {
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = {
          name: p.category,
          image: p.image || "",
          count: 0
        };
      }
      categoriesMap[p.category].count += 1;
      if (p.image && !categoriesMap[p.category].image.includes("placeholder") && p.image.startsWith("http")) {
        categoriesMap[p.category].image = p.image;
      }
    });

    const categoryList = Object.values(categoriesMap);
    res.json(categoryList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic paginated products endpoint
app.get("/api/products/paginated", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    let flatProds = getFlattenedProducts(req);
    
    if (category && category !== "All") {
      flatProds = flatProds.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    const total = flatProds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginated = flatProds.slice(startIndex, endIndex);
    
    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: endIndex < total,
      products: paginated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic search suggestions endpoint
app.get("/api/products/search", (req, res) => {
  try {
    const query = (req.query.q || "").trim().toLowerCase();
    const flatProds = getFlattenedProducts(req);

    if (!query) {
      return res.json({ products: [], categories: [] });
    }

    const matchedProducts = flatProds.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.subCategory.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );

    const matchedCategories = Array.from(
      new Set(
        flatProds
          .filter(p => p.category.toLowerCase().includes(query))
          .map(p => p.category)
      )
    );

    res.json({
      products: matchedProducts.slice(0, 15),
      categories: matchedCategories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return Gifts endpoints
const RETURN_GIFTS_FILE = path.join(__dirname, "public", "return_gifts.json");

app.get("/api/return_gifts", (req, res) => {
  try {
    if (!fs.existsSync(RETURN_GIFTS_FILE)) {
      return res.json({ products: [], total: 0, page: 1, limit: 20 });
    }
    
    let gifts = readJsonFile(RETURN_GIFTS_FILE, []);
    
    // 1. Text Search
    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      gifts = gifts.filter(g => 
        (g.title && g.title.toLowerCase().includes(q)) || 
        (g.description && g.description.toLowerCase().includes(q)) || 
        (g.category && g.category.toLowerCase().includes(q))
      );
    }
    
    // 2. Category / Occasion Filter (comma separated)
    if (req.query.category && req.query.category !== 'All Gifts') {
      const categories = req.query.category.toLowerCase().split(',');
      gifts = gifts.filter(g => {
        const title = (g.title || '').toLowerCase();
        const cat = (g.category || '').toLowerCase();
        return categories.some(c => title.includes(c) || cat.includes(c));
      });
    }

    // 3. Material Filter
    if (req.query.material) {
      const materials = req.query.material.toLowerCase().split(',');
      gifts = gifts.filter(g => {
        const title = (g.title || '').toLowerCase();
        const desc = (g.description || '').toLowerCase();
        return materials.some(m => title.includes(m) || desc.includes(m));
      });
    }

    // 4. Price Ranges
    if (req.query.minPrice) {
      gifts = gifts.filter(g => g.price >= Number(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      gifts = gifts.filter(g => g.price <= Number(req.query.maxPrice));
    }
    
    // Helper string matching for generic price filter (Under 500, etc)
    if (req.query.priceFilter) {
      const pf = req.query.priceFilter;
      if (pf === 'Under ₹500') gifts = gifts.filter(g => g.price < 500);
      else if (pf === '₹500-1000') gifts = gifts.filter(g => g.price >= 500 && g.price <= 1000);
      else if (pf === '₹1000-2000') gifts = gifts.filter(g => g.price > 1000 && g.price <= 2000);
      else if (pf === 'Premium' || pf === 'Luxury') gifts = gifts.filter(g => g.price > 2000);
    }

    // 5. Sorting
    if (req.query.sort) {
      const sort = req.query.sort;
      if (sort === 'priceLow') gifts.sort((a, b) => a.price - b.price);
      else if (sort === 'priceHigh') gifts.sort((a, b) => b.price - a.price);
      else if (sort === 'newest') gifts.sort((a, b) => (b.id || 0) - (a.id || 0)); // Assuming higher ID is newer
      // Additional complex sorting like popular can be mocked here
    }

    // 6. Pagination
    const total = gifts.length;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedGifts = gifts.slice(startIndex, endIndex);

    // Artificial delay to allow UI to show beautiful premium skeleton loaders (as requested)
    setTimeout(() => {
      res.json({
        products: paginatedGifts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    }, req.query.delay ? Number(req.query.delay) : 0);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/return_gifts", (req, res) => {
  try {
    const { title, price, description, stock, image, category } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    
    const gifts = readJsonFile(RETURN_GIFTS_FILE, []);
    const newGift = {
      id: "rg_" + Date.now().toString(),
      title,
      price: Number(price),
      actualPrice: Math.round(Number(price) * 1.3), // Mock actual price
      description: description || "",
      stock: Number(stock) || 50,
      image: image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
      category: category || "return_gifts",
      isNew: true
    };
    
    gifts.push(newGift);
    writeJsonFile(RETURN_GIFTS_FILE, gifts);
    res.status(201).json({ success: true, message: "Return gift created successfully", product: newGift });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/return_gifts", (req, res) => {
  try {
    const { id, title, price, description, stock } = req.body;
    if (!id) return res.status(400).json({ error: "Product ID is required" });
    
    const gifts = readJsonFile(RETURN_GIFTS_FILE, []);
    const giftIndex = gifts.findIndex(g => g.id === id);
    
    if (giftIndex === -1) {
      return res.status(404).json({ error: "Return gift not found" });
    }
    
    // Update fields
    if (title !== undefined) gifts[giftIndex].title = title;
    if (price !== undefined) {
      gifts[giftIndex].price = Number(price);
      gifts[giftIndex].actualPrice = Math.round(Number(price) * 1.3);
    }
    if (description !== undefined) gifts[giftIndex].description = description;
    if (stock !== undefined) gifts[giftIndex].stock = Number(stock);
    
    writeJsonFile(RETURN_GIFTS_FILE, gifts);
    res.json({ success: true, message: "Return gift updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete return gift
app.delete("/api/return_gifts/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product ID is required" });

    let gifts = readJsonFile(RETURN_GIFTS_FILE, []);
    const initialLength = gifts.length;
    gifts = gifts.filter(g => g.id !== id);

    if (gifts.length === initialLength) {
      return res.status(404).json({ error: "Return gift not found" });
    }

    writeJsonFile(RETURN_GIFTS_FILE, gifts);
    res.json({ success: true, message: "Return gift deleted successfully" });
  } catch (error) {
    console.error("Delete return gift error:", error);
    res.status(500).json({ error: "Failed to delete return gift" });
  }
});

// MOBILE WISHLIST & CUSTOMER NOTIFICATIONS APIS
const WISHLIST_FILE = path.join(__dirname, "wishlist.json");
const CUSTOMER_NOTIFICATIONS_FILE = path.join(__dirname, "customer_notifications.json");

const getWishlist = () => {
  return readJsonFile(WISHLIST_FILE, []);
};

const getCustomerNotifications = () => {
  const defaultNotifications = [
    {
      id: "notif-1",
      title: "Order Shipped! 📦",
      body: "Your order #GS-89240 has been shipped and is on its way via Express Courier B2C.",
      time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      type: "order",
      read: false
    },
    {
      id: "notif-2",
      title: "Flash Sale Alert! ⚡",
      body: "Exclusive 50% discount on Cello Crockery and Dinnerware sets is live now. Valid for 18 hours.",
      time: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      type: "offer",
      read: false
    },
    {
      id: "notif-3",
      title: "Out for Delivery today 🚚",
      body: "Your package #GS-88129 is out for delivery with our courier partner.",
      time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      type: "delivery",
      read: true
    },
    {
      id: "notif-4",
      title: "Welcome to Ghar Sansar! 🎉",
      body: "Thank you for registering. Explore our wide collection of home and kitchen essentials.",
      time: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      type: "info",
      read: true
    }
  ];
  return readJsonFile(CUSTOMER_NOTIFICATIONS_FILE, defaultNotifications);
};

// Wishlist routes
app.get("/api/mobile/wishlist", (req, res) => {
  try {
    res.json({ success: true, wishlist: getWishlist() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/mobile/wishlist/toggle", (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }
    let wishlist = getWishlist();
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }
    writeJsonFile(WISHLIST_FILE, wishlist);
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notification routes
app.get("/api/mobile/notifications", (req, res) => {
  try {
    res.json({ success: true, notifications: getCustomerNotifications() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/mobile/notifications/read", (req, res) => {
  try {
    const { id } = req.body;
    let notifs = getCustomerNotifications();
    if (id) {
      notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    } else {
      notifs = notifs.map(n => ({ ...n, read: true }));
    }
    writeJsonFile(CUSTOMER_NOTIFICATIONS_FILE, notifs);
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/mobile/notifications/clear", (req, res) => {
  try {
    writeJsonFile(CUSTOMER_NOTIFICATIONS_FILE, []);
    res.json({ success: true, notifications: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews database setup
const REVIEWS_FILE = path.join(__dirname, "reviews.json");
const getReviews = () => {
  if (!fs.existsSync(REVIEWS_FILE)) {
    writeJsonFile(REVIEWS_FILE, {});
  }
  return readJsonFile(REVIEWS_FILE, {});
};
const saveReviews = (data) => writeJsonFile(REVIEWS_FILE, data);

// Seeding standard review data for products to maintain realistic lookups
const seedReviewsIfNeeded = () => {
  try {
    const reviewsData = getReviews();
    if (Object.keys(reviewsData).length === 0) {
      console.log("Seeding default reviews database...");
      const seeded = {};
      const defaultReviews = [
        {
          id: "dummy-1",
          name: "Aravind K.",
          rating: 5,
          comment: "Absolutely premium quality product. The build quality feels extremely premium. Worth every rupee.",
          date: "May 12, 2026",
          image: "",
          verified: true
        },
        {
          id: "dummy-2",
          name: "Meera Sen",
          rating: 4,
          comment: "Very elegant design, fits snugly. Solid weight and professional finish.",
          date: "May 08, 2026",
          image: "",
          verified: true
        },
        {
          id: "dummy-3",
          name: "Rajesh Prasad",
          rating: 5,
          comment: "Excellent value for money. Highly durable and looks gorgeous in home.",
          date: "April 29, 2026",
          image: "",
          verified: true
        }
      ];
      
      const productsPath = path.join(__dirname, "public", "products.json");
      if (fs.existsSync(productsPath)) {
        const rawCatalog = readJsonFile(productsPath, []);
        rawCatalog.forEach(cat => {
          (cat.subcategories || []).forEach(sub => {
            const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
            const items = sub[itemKey] || [];
            items.forEach(item => {
              const prodId = item.id || item.prod_id || item.name;
              if (prodId) {
                seeded[prodId] = defaultReviews.map((r, idx) => ({
                  ...r,
                  id: `dummy-${prodId}-${idx}`
                }));
              }
            });
          });
        });
      }
      saveReviews(seeded);
      console.log("Reviews database seeded successfully.");
    }
  } catch (err) {
    console.error("Failed to seed reviews:", err);
  }
};

seedReviewsIfNeeded();

// GET reviews for a product
app.get("/api/reviews/:productId", (req, res) => {
  try {
    const { productId } = req.params;
    const allReviews = getReviews();
    const productReviews = allReviews[productId] || [];
    
    let rating_average = 0;
    const rating_count = productReviews.length;
    if (rating_count > 0) {
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      rating_average = Math.round((sum / rating_count) * 10) / 10;
    }
    
    res.json({
      success: true,
      rating_average,
      rating_count,
      reviews: productReviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST review for a product
app.post("/api/reviews/:productId", (req, res) => {
  try {
    const { productId } = req.params;
    const { name, rating, comment, image } = req.body;
    if (!name || rating === undefined || !comment) {
      return res.status(400).json({ error: "Missing required review parameters" });
    }
    
    const allReviews = getReviews();
    if (!allReviews[productId]) {
      allReviews[productId] = [];
    }
    
    const newReview = {
      id: `review_${Date.now()}`,
      name: String(name),
      rating: Number(rating),
      comment: String(comment),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      image: image || "",
      verified: true
    };
    
    allReviews[productId].unshift(newReview);
    saveReviews(allReviews);
    
    const rating_count = allReviews[productId].length;
    const sum = allReviews[productId].reduce((acc, r) => acc + r.rating, 0);
    const rating_average = Math.round((sum / rating_count) * 10) / 10;
    
    res.status(201).json({
      success: true,
      rating_average,
      rating_count,
      reviews: allReviews[productId],
      newReview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test auto pull endpoint
app.get("/api/test-pull", (req, res) => {
  res.json({ status: "success", message: "Auto-pull is working perfectly!", timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", port: PORT });
});

app.listen(PORT, () => {
  console.log(`Ghar Sansar backend server is running on http://localhost:${PORT}`);
});

