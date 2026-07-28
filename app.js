const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = "admin123";
const DATA_FILE = path.join(__dirname, 'products.json');

app.use(express.static('public'));
app.use(express.json());

function getProducts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

app.get('/api/products', (req, res) => {
  res.json(getProducts());
});

app.post('/api/products', (req, res) => {
  const { passkey, name, price, image, description } = req.body;
  if (passkey !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Admin Password မှားယွင်းနေပါသည်။" });
  }
  if (!name || !price) {
    return res.status(400).json({ error: "အမည်နှင့် စျေးနှုန်း ထည့်ပေးပါ။" });
  }

  const products = getProducts();
  const newProduct = {
    id: Date.now(),
    name,
    price,
    image: image || 'https://via.placeholder.com/300x200?text=No+Image',
    description
  };
  products.push(newProduct);
  saveProducts(products);

  res.json({ message: "Product အသစ် တင်ပြီးပါပြီ။" });
});

app.delete('/api/products/:id', (req, res) => {
  const passkey = req.headers['x-passkey'];
  if (passkey !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Admin Password မှားယွင်းနေပါသည်။" });
  }

  const id = parseInt(req.params.id);
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);

  res.json({ message: "Product ကို ဖျက်လိုက်ပါပြီ။" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
