import fs from 'fs/promises';
import path from 'path';

async function merge() {
    const productsPath = path.join(process.cwd(), 'public/products.json');
    const newProductsPath = path.join(process.cwd(), 'public/products/23_evening_products.json');

    const existingData = JSON.parse(await fs.readFile(productsPath, 'utf8'));
    const newData = JSON.parse(await fs.readFile(newProductsPath, 'utf8'));

    // Create a subcategory format
    const newCategory = {
        name: "23_evening",
        subcategories: [
            {
                "name": "evening_collection",
                "images": newData.map(p => ({
                    name: p.name,
                    image: p.image,
                    description: p.description,
                    price: p.price,
                    "act-price": p.actualPrice
                }))
            }
        ]
    };

    // Check if "23_evening" category already exists
    const existingIndex = existingData.findIndex(c => c.name === '23_evening');
    if (existingIndex >= 0) {
        existingData[existingIndex] = newCategory;
    } else {
        existingData.push(newCategory);
    }

    await fs.writeFile(productsPath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log('Successfully merged 23_evening products into public/products.json');
}

merge().catch(console.error);
