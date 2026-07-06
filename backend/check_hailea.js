const http = require('http');

http.get('http://localhost:5001/api/storage/upload/products', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    let found = false;
    json.data.forEach(cat => {
      cat.subcategories.forEach(sub => {
        const items = sub.products || sub.images || [];
        items.forEach(item => {
          if (item.image && item.image.includes('hailea')) {
            console.log("FOUND:", item.title, "in", cat.name, "->", sub.name);
            found = true;
          }
        });
      });
    });
    if (!found) console.log("NOT FOUND in /api/storage/upload/products");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
