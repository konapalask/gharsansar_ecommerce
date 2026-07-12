const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'products', 'Garlands');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

let html = `
<!DOCTYPE html>
<html>
<head>
<title>Garlands</title>
<style>
  body { font-family: sans-serif; display: flex; flex-wrap: wrap; }
  .card { border: 1px solid #ccc; margin: 10px; padding: 10px; width: 300px; text-align: center; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
`;

files.forEach(f => {
  html += `
  <div class="card">
    <h4>${f}</h4>
    <img src="${f}" />
  </div>
  `;
});

html += `</body></html>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('Generated index.html');
