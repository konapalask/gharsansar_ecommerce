const fs = require('fs');
const path = require('path');
const https = require('https');

const localProductsPath = path.join(__dirname, 'public', 'products.json');

// Download live products.json
https.get('https://backend.gharsansar.store/products.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const liveData = JSON.parse(data);
      const localData = JSON.parse(fs.readFileSync(localProductsPath, 'utf8'));
      
      let updatedPricesCount = 0;

      // Create a map of live prices
      const livePrices = {};
      liveData.forEach(cat => {
        if (!cat.subcategories) return;
        cat.subcategories.forEach(sub => {
          const items = sub.products || sub.images || [];
          items.forEach(item => {
            const id = item.prod_id || item.id || item.name;
            if (id) {
              livePrices[id] = { price: item.price, actual_price: item["act-price"] };
            }
          });
        });
      });

      // Update local data with live prices
      localData.forEach(cat => {
        if (!cat.subcategories) return;
        cat.subcategories.forEach(sub => {
          const items = sub.products || sub.images || [];
          items.forEach(item => {
            const id = item.prod_id || item.id || item.name;
            if (id && livePrices[id]) {
              if (item.price !== livePrices[id].price) {
                item.price = livePrices[id].price;
                updatedPricesCount++;
              }
              if (item["act-price"] !== livePrices[id].actual_price) {
                item["act-price"] = livePrices[id].actual_price;
              }
            }
          });
        });
      });

      fs.writeFileSync(localProductsPath, JSON.stringify(localData, null, 2));
      console.log(`Successfully merged ${updatedPricesCount} updated prices from the live server!`);
    } catch (err) {
      console.error("Error parsing or merging:", err);
    }
  });
}).on('error', err => {
  console.error("Error downloading live products.json:", err);
});
