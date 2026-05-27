const ADMIN_PASSWORD = "thennu123";

const WHATSAPP_NUMBER = "919629603245";

const INSTAGRAM_URL =
"https://www.instagram.com/thennu_artist_143";

const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwtUiJsmaTgxCU1Q2LBzpTmyzi4QMGxuVc3V-Y5L35E9Yyq-3gR_C-75Utjw6L9SboDJg/exec";

let selected = null;

let cart = JSON.parse(
  localStorage.getItem('thennu_cart') || '[]'
);

let selectedRating = 0;


// ===== PRODUCTS =====

async function getProducts(){

  try{

    const res = await fetch(SCRIPT_URL);

    return await res.json();

  }catch(err){

    console.error(err);

    return [];

  }

}

async function addProductToSheet(product){

  await fetch(SCRIPT_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"add",
      ...product
    })
  });

}

async function editProductInSheet(product){

  await fetch(SCRIPT_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"edit",
      ...product
    })
  });

}

async function deleteProductFromSheet(code){

  await fetch(SCRIPT_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"delete",
      code
    })
  });

}

async function loadProducts(){

  const products = await getProducts();

  const container =
    document.getElementById("products");

  if(products.length === 0){

    container.innerHTML = `
      <p style="
      text-align:center;
      grid-column:1/-1;
      padding:40px;
      color:#aaa">
      No products yet
      </p>
    `;

    return;

  }

  container.innerHTML = products.map(p=>`

    <div class="card">

      <img src="${p.Image}">

      ${p.Tag ? `
        <div class="badge">${p.Tag}</div>
      ` : ""}

      ${p.Old > p.Price ? `
        <div class="offer-badge">
          Save ₹${p.Old - p.Price}
        </div>
      ` : ""}

      <div class="card-body">

        <small style="color:gold">
          ${p.Code}
        </small>

        <h4>${p.Name}</h4>

        <div class="price-row">

          <span class="price">
            ₹${p.Price}
          </span>

          ${p.Old ? `
            <span class="old-price">
              ₹${p.Old}
            </span>
          ` : ""}

        </div>

        <button
          class="btn"
          onclick="openModal('${p.Code}')">

          Customize & Add

        </button>

      </div>

    </div>

  `).join('');

}

async function openModal(code){

  const products = await getProducts();

  selected =
    products.find(p=>p.Code === code);

  document
    .getElementById('modal')
    .classList.add('open');

}

function closeModal(){

  document
    .getElementById('modal')
    .classList.remove('open');

}


// ===== CART =====

function addToCart(){

  const custom =
    document.getElementById('nameInput')
    .value.trim();

  if(!custom)
    return alert("Enter custom name");

  cart.push({
    ...selected,
    custom
  });

  localStorage.setItem(
    'thennu_cart',
    JSON.stringify(cart)
  );

  updateCart();

  closeModal();

}

function removeFromCart(i){

  cart.splice(i,1);

  localStorage.setItem(
    'thennu_cart',
    JSON.stringify(cart)
  );

  updateCart();

}

function toggleCart(){

  document
    .getElementById('cart')
    .classList.toggle('open');

}

function updateCart(){

  document
    .getElementById('cartCount')
    .innerText = cart.length;

  const items =
    document.getElementById('cartItems');

  let total = 0;

  if(cart.length === 0){

    items.innerHTML = `
      <p style="
      text-align:center;
      color:#aaa;
      padding:30px">
      Cart is empty
      </p>
    `;

  }else{

    items.innerHTML = cart.map((c,i)=>{

      total += Number(c.Price);

      return `

      <div class="cart-item">

        <div>

          <strong>${c.Name}</strong>

          <br>

          ${c.custom}

          <br>

          <small style="color:gold">
            ${c.Code}
          </small>

        </div>

        <div>

          ₹${c.Price}

          <br><br>

          <button
            class="cart-remove"
            onclick="removeFromCart(${i})">

            ✕

          </button>

        </div>

      </div>

      `;

    }).join('');

  }

  document
    .getElementById('total')
    .innerText = total;

}

function sendWhatsAppOrder(){

  if(cart.length === 0)
    return alert("Cart empty");

  let msg = "🛒 *New Order*%0A%0A";

  let total = 0;

  cart.forEach(c=>{

    msg +=
`• ${c.Code}
${c.Name}
Custom: ${c.custom}
₹${c.Price}

`;

    total += Number(c.Price);

  });

  msg += `%0A💰 Total: ₹${total}`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`
  );

}


// ===== SOCIAL =====

function openInstagram(){

  window.open(INSTAGRAM_URL);

}

function openWhatsApp(){

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}`
  );

}


// ===== REVIEWS =====

function getReviews(){

  return JSON.parse(
    localStorage.getItem('thennu_reviews') || '[]'
  );

}

function saveReviews(reviews){

  localStorage.setItem(
    'thennu_reviews',
    JSON.stringify(reviews)
  );

}

function setRating(n){

  selectedRating = n;

  document
    .querySelectorAll('.star-select span')
    .forEach((s,i)=>{

      s.classList.toggle(
        'active',
        i < n
      );

    });

}

function submitReview(){

  const name =
    document.getElementById('revName').value;

  const text =
    document.getElementById('revText').value;

  if(!name || !text || selectedRating === 0){

    return alert("Fill all fields");

  }

  const reviews = getReviews();

  reviews.unshift({
    name,
    text,
    rating:selectedRating,
    date:new Date().toLocaleDateString()
  });

  saveReviews(reviews);

  loadReviews();

}

function loadReviews(){

  const reviews = getReviews();

  const grid =
    document.getElementById('reviewsGrid');

  if(reviews.length === 0){

    grid.innerHTML = `
      <p style="
      text-align:center;
      grid-column:1/-1;
      color:#aaa">
      No reviews yet
      </p>
    `;

    return;

  }

  grid.innerHTML = reviews.map(r=>`

    <div class="review-card">

      <div class="review-header">

        <strong>${r.name}</strong>

        <span class="review-stars">
          ${'★'.repeat(r.rating)}
        </span>

      </div>

      <p>${r.text}</p>

      <div class="review-date">
        ${r.date}
      </div>

    </div>

  `).join('');

}


// ===== ADMIN =====

function openAdminLogin(){

  document
    .getElementById('adminOverlay')
    .classList.add('open');

}

function closeAdmin(){

  document
    .getElementById('adminOverlay')
    .classList.remove('open');

}

function checkAdminPass(){

  const pass =
    document.getElementById('adminPass').value;

  if(pass === ADMIN_PASSWORD){

    document
      .getElementById('adminLogin')
      .style.display = 'none';

    document
      .getElementById('adminDashboard')
      .style.display = 'block';

    loadAdminTable();

  }else{

    document
      .getElementById('loginError')
      .style.display = 'block';

  }

}

async function loadAdminTable(){

  const products = await getProducts();

  const tbody =
    document.getElementById('adminProductList');

  const empty =
    document.getElementById('emptyState');

  if(products.length === 0){

    empty.style.display = 'block';

    tbody.innerHTML = '';

    return;

  }

  empty.style.display = 'none';

  tbody.innerHTML = products.map(p=>`

    <tr>

      <td>
        <img src="${p.Image}">
      </td>

      <td>

        ${p.Name}

        <br>

        <small style="color:gold">
          ${p.Code}
        </small>

      </td>

      <td>
        ₹${p.Price}
      </td>

      <td>
        ${p.Tag || '-'}
      </td>

      <td>

        <div class="actions">

          <button
            class="btn-edit"
            onclick="editProduct('${p.Code}')">

            Edit

          </button>

          <button
            class="btn-delete"
            onclick="deleteProduct('${p.Code}')">

            Delete

          </button>

        </div>

      </td>

    </tr>

  `).join('');

}

async function saveProduct(){

  const code =
    document.getElementById('editId').value;

  const product = {

    code,

    name:
      document.getElementById('pName').value,

    price:
      document.getElementById('pPrice').value,

    old:
      document.getElementById('pOld').value,

    tag:
      document.getElementById('pTag').value,

    image:
      document.getElementById('pImage').value

  };

  if(!product.name)
    return alert("Enter product name");

  if(!product.price)
    return alert("Enter price");

  if(code){

    await editProductInSheet(product);

  }else{

    await addProductToSheet(product);

  }

  resetForm();

  loadProducts();

  loadAdminTable();

}

async function editProduct(code){

  const products = await getProducts();

  const p =
    products.find(x=>x.Code === code);

  if(!p) return;

  document.getElementById('editId').value =
    p.Code;

  document.getElementById('pCode').value =
    p.Code;

  document.getElementById('pName').value =
    p.Name;

  document.getElementById('pPrice').value =
    p.Price;

  document.getElementById('pOld').value =
    p.Old;

  document.getElementById('pTag').value =
    p.Tag;

  document.getElementById('pImage').value =
    p.Image;

}

async function deleteProduct(code){

  if(!confirm("Delete product?"))
    return;

  await deleteProductFromSheet(code);

  loadProducts();

  loadAdminTable();

}

function resetForm(){

  [
    'editId',
    'pCode',
    'pName',
    'pPrice',
    'pOld',
    'pTag',
    'pImage'
  ].forEach(id=>{

    document.getElementById(id).value = '';

  });

}


// ===== INIT =====

loadProducts();

updateCart();

loadReviews();