// Fetch products from API and render as cards
async function loadProducts() {
  try {
    const res = await fetch('http://localhost:4000/api/products');
    const products = await res.json();
    const list = document.getElementById('product-list');

    list.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.ImageUrl || 'https://via.placeholder.com/150'}" alt="${p.Name}">
        <h2>${p.Name}</h2>
        <p>R${p.Price.toFixed(2)}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

// When page is ready, load products
window.addEventListener('DOMContentLoaded', loadProducts);
