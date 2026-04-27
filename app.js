// ===== CONFIG =====
const ADMIN_PASSWORD = "thennu123";
const WHATSAPP_NUMBER = "919629603245"; // Your number with country code, NO + sign
const INSTAGRAM_URL = "https://www.instagram.com/thennu_artist_143?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="; // Replace with your Instagram page URL

// ===== DEFAULT PRODUCTS =====
const defaultProducts = [
  { id: 1, name: "Couple Keychain", price: 149, old: 199, image: "https://via.placeholder.com/400x300/1a1a2e/D4AF37?text=Couple+Keychain", tag: "Best Seller" },
  { id: 2, name: "Name Keychain", price: 149, old: 0, image: "https://via.placeholder.com/400x300/1a1a2e/D4AF37?text=Name+Keychain", tag: "Trending" },
  { id: 3, name: "Photo Keychain", price: 199, old: 249, image: "https://via.placeholder.com/400x300/1a1a2e/D4AF37?text=Photo+Keychain", tag: "New" },
];

// ===== DATA HELPERS =====
function getProducts() {
  const stored = localStorage.getItem('thennu_products');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('thennu_products', JSON.stringify(defaultProducts));
  return [...defaultProducts];
}
function saveProductsData(products) {
  localStorage.setItem('thennu_products', JSON.stringify(products));
}
function getReviews() {
  return JSON.parse(localStorage.getItem('thennu_reviews') || '[]');
}
function saveReviews(reviews) {
  localStorage.setItem('thennu_reviews', JSON.stringify(reviews));
}

// ===== STATE =====
let selected = null;
let cart = [];
let editingReview = null;

// ===== STOREFRONT =====
function loadProducts() {
  const products = getProducts();
  const container = document.getElementById("products");
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);grid-column:1/-1;font-size:18px;padding:40px">✨ New products coming soon!</p>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x300/1a1a2e/D4AF37?text=No+Image'">
        <div class="card-overlay"></div>
      </div>
      ${p.tag ? `<div class="badge">${p.tag}</div>` : ""}
      ${p.old && p.old > p.price ? `<div class="offer-badge">Save ₹${p.old - p.price}</div>` : ""}
      <div class="card-body">
        <h4>${p.name}</h4>
        <div class="price-row">
          <span class="price">₹${p.price}</span>
          ${p.old && p.old > p.price ? `<span class="old-price">₹${p.old}</span>` : ""}
        </div>
        <button class="btn" onclick="openModal(${p.id})">Customize & Add</button>
      </div>
    </div>
  `).join('');
}

// ===== MODAL =====
function openModal(id) {
  selected = getProducts().find(p => p.id === id);
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('nameInput').focus(), 100);
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('nameInput').value = '';
}

// ===== CART =====
function addToCart() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) return alert('Please enter a name');
  cart.push({ ...selected, custom: name });
  closeModal();
  updateCart();
}
function removeFromCart(i) {
  cart.splice(i, 1);
  updateCart();
}
function updateCart() {
  document.getElementById('cartCount').innerText = cart.length;
  let total = 0;
  const items = document.getElementById('cartItems');
  if (cart.length === 0) {
    items.innerHTML = '<p style="color:var(--muted);text-align:center;padding:30px 0">Your cart is empty</p>';
  } else {
    items.innerHTML = cart.map((c, i) => {
      total += c.price;
      return `<div class="cart-item">
        <div class="cart-item-info"><strong>${c.name}</strong><br><span>${c.custom}</span></div>
        <div class="cart-item-right">
          <span style="color:var(--gold);font-weight:700">₹${c.price}</span>
          <button class="cart-remove" onclick="removeFromCart(${i})">✕</button>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('total').innerText = total;
}
function toggleCart() { document.getElementById('cart').classList.toggle('open'); }

// ===== WHATSAPP =====
function openWhatsApp() {
  // General contact — always works, no cart needed
  const msg = encodeURIComponent("Hi! I'm interested in your products 🛍");
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

function sendWhatsAppOrder() {
  if (cart.length === 0) return alert('Your cart is empty! Add items first.');
  let msg = '🛒 *New Order*\n\n';
  let total = 0;
  cart.forEach(c => {
    msg += `• ${c.name} — "${c.custom}" — ₹${c.price}\n`;
    total += c.price;
  });
  msg += `\n*Total: ₹${total}*`;
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ===== INSTAGRAM =====
function openInstagram() {
  window.location.href = INSTAGRAM_URL;
}

// ===== REVIEWS =====
let selectedRating = 0;

function setRating(n) {
  selectedRating = n;
  document.querySelectorAll('.star-select span').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
}

function submitReview() {
  const name = document.getElementById('revName').value.trim();
  const text = document.getElementById('revText').value.trim();
  const product = document.getElementById('revProduct').value;
  if (!name || !text || selectedRating === 0) return alert('Please fill in all fields and select a rating');

  const reviews = getReviews();
  reviews.unshift({
    id: Date.now(),
    name,
    text,
    product,
    rating: selectedRating,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  });
  saveReviews(reviews);
  document.getElementById('revName').value = '';
  document.getElementById('revText').value = '';
  document.getElementById('revProduct').value = '';
  setRating(0);
  loadReviews();
}

function loadReviews() {
  const reviews = getReviews();
  const grid = document.getElementById('reviewsGrid');
  if (reviews.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:30px">No reviews yet. Be the first to share your experience!</p>';
    return;
  }
  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-name">${r.name}</span>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      ${r.product ? `<div style="color:var(--gold);font-size:12px;margin-bottom:6px">📦 ${r.product}</div>` : ''}
      <div class="review-text">${r.text}</div>
      <div class="review-date">${r.date}</div>
    </div>
  `).join('');
}

// ===== ADMIN =====
function openAdminLogin() {
  document.getElementById('adminOverlay').classList.add('open');
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminPass').value = '';
  document.getElementById('loginError').style.display = 'none';
  setTimeout(() => document.getElementById('adminPass').focus(), 100);
}
function checkAdminPass() {
  if (document.getElementById('adminPass').value === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadAdminTable();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}
function closeAdmin() {
  document.getElementById('adminOverlay').classList.remove('open');
  resetForm();
  loadProducts();
}

function loadAdminTable() {
  const products = getProducts();
  const tbody = document.getElementById('adminProductList');
  const empty = document.getElementById('emptyState');
  if (products.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50/1a1a2e/D4AF37?text=?'"></td>
      <td>${p.name}</td>
      <td>₹${p.price}${p.old && p.old > p.price ? ` <span style="text-decoration:line-through;color:var(--muted);font-size:12px">₹${p.old}</span>` : ''}</td>
      <td>${p.tag || '—'}</td>
      <td><div class="actions">
        <button class="btn-edit" onclick="editProduct(${p.id})">✏ Edit</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑 Delete</button>
      </div></td>
    </tr>
  `).join('');
}

function saveProduct() {
  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value);
  const old = parseInt(document.getElementById('pOld').value) || 0;
  const tag = document.getElementById('pTag').value.trim();
  const image = document.getElementById('pImage').value.trim() || 'https://via.placeholder.com/400x300/1a1a2e/D4AF37?text=Product';
  const editId = document.getElementById('editId').value;

  if (!name) return alert('Product name is required');
  if (!price || price <= 0) return alert('Enter a valid price');

  let products = getProducts();
  if (editId) {
    products = products.map(p => p.id == editId ? { ...p, name, price, old, tag, image } : p);
  } else {
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    products.push({ id: maxId + 1, name, price, old, tag, image });
  }
  saveProductsData(products);
  resetForm();
  loadAdminTable();
}

function editProduct(id) {
  const p = getProducts().find(p => p.id === id);
  if (!p) return;
  document.getElementById('editId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOld').value = p.old || '';
  document.getElementById('pTag').value = p.tag || '';
  document.getElementById('pImage').value = p.image || '';
  document.getElementById('formTitle').textContent = '✏ Edit Product';
  document.getElementById('adminDashboard').scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  saveProductsData(getProducts().filter(p => p.id !== id));
  loadAdminTable();
}

function resetForm() {
  ['editId', 'pName', 'pPrice', 'pOld', 'pTag', 'pImage'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('formTitle').textContent = 'Add New Product';
}

// ===== INIT =====
loadProducts();
updateCart();
loadReviews();
