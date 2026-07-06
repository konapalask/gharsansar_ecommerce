const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'products.json');
const rawData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const cat = rawData.find(c => c.name === 'Aquarium & Accessories');
if (!cat) process.exit(1);

let itemsToMove = [];
// Extract items with id starting with new_
cat.subcategories.forEach(sub => {
    let items = sub.products || sub.images || [];
    let remainingItems = [];
    items.forEach(item => {
        if (item.id && item.id.startsWith('new_1782992350357')) {
            itemsToMove.push(item);
        } else {
            remainingItems.push(item);
        }
    });
    if (sub.products) sub.products = remainingItems;
    if (sub.images) sub.images = remainingItems;
});

// Re-add them to correct categories
itemsToMove.forEach(item => {
    const title = item.title.toLowerCase();
    let targetSubName = "Aquarium Fish Food & Feeders";
    
    if (title.includes("filter") || title.includes("ceramic rings") || title.includes("sponge") || title.includes("syphon") || title.includes("cure") || title.includes("fungus") || title.includes("carbon")) {
        targetSubName = "Filters & Water Care";
    } else if (title.includes("pump") || title.includes("compressor") || title.includes("air")) {
        targetSubName = "Air Pumps & Oxygenators";
    } else if (title.includes("heater") || title.includes("tank")) {
        targetSubName = "Aquarium Tanks & Heaters";
    } else if (title.includes("ornament") || title.includes("decor") || title.includes("rock") || title.includes("mountain") || title.includes("tree")) {
        targetSubName = "Ornaments & Decorations";
    }

    let targetSub = cat.subcategories.find(s => s.name === targetSubName);
    if (!targetSub) targetSub = cat.subcategories[0];

    if (targetSub.products) {
        targetSub.products.push(item);
    } else if (targetSub.images) {
        targetSub.images.push(item);
    }
});

fs.writeFileSync(productsPath, JSON.stringify(rawData, null, 2));
console.log(`Re-categorized ${itemsToMove.length} items.`);
