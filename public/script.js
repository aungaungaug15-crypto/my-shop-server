const MY_PHONE_NUMBER = "09123456789";

function loadProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      const grid = document.getElementById('productGrid');
      grid.innerHTML = '';

      if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">လောလောဆယ် ရောင်းရန် Product များ မရှိသေးပါ။</p>';
        return;
      }

      products.forEach(p => {
        grid.innerHTML += `
          <div class="card">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="card-body">
              <div class="card-title">${p.name}</div>
              <div class="card-price">${p.price}</div>
              <div class="card-desc">${p.description || ''}</div>
              <a class="buy-btn" href="tel:${MY_PHONE_NUMBER}">📞 ဖုန်းဖြင့် မှာယူမည်</a>
            </div>
          </div>
        `;
      });
    });
}

loadProducts();
