// ===============================
// THENNU ARTIST — PREMIUM VERSION
// Updated Luxury UI + Fixed Cart
// ===============================

// Configuration
const CONFIG = {
    ADMIN_PASSWORD: 'thennu123',
    WHATSAPP_NUMBER: '919629603245',

    API_URL:
        'https://script.google.com/macros/s/AKfycbxs8VSTZYyIDbtsQwPfXmn9vEK9DoHPETCUHFMysuYaRCFBAvvq0FAeI4gaJGSngN0fsw/exec'
};

// ===============================
// STATE
// ===============================

let products = [];
let cart = [];
let currentProduct = null;
let editingProductId = null;

const LOCAL_PRODUCTS_KEY = 'thennuProducts';
const REVIEWS_KEY = 'thennuReviews';

// ===============================
// HERO IMAGES
// ===============================

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',

    'https://images.unsplash.com/photo-1519741496106-6a9b5f8d4f8b?auto=format&fit=crop&w=1400&q=80',

    'https://images.unsplash.com/photo-1495121605193-b116b5b09b22?auto=format&fit=crop&w=1400&q=80'
];

let heroIndex = 0;
let heroTimer = null;

// ===============================
// INIT
// ===============================

document.addEventListener('DOMContentLoaded', () => {

    loadCart();
    loadProducts();
    loadReviews();

    updateCartCount();

    loadLogo();

    startHeroCarousel();

    if (typeof gsap !== 'undefined') {
        initAnimations();
    }

    // FIX OVERLAY BUG
    const overlay = document.getElementById('overlay');

    overlay.addEventListener('click', () => {
        closeAllModals();
    });

    // PREVENT CART CLOSE
    const cartSidebar = document.getElementById('cartSidebar');

    cartSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

});

// ===============================
// LOCAL STORAGE
// ===============================

function loadSavedProducts() {

    try {

        const saved =
            localStorage.getItem(LOCAL_PRODUCTS_KEY);

        return saved ? JSON.parse(saved) : [];

    } catch (error) {

        console.error(error);

        return [];

    }

}

function saveProductsLocally() {

    localStorage.setItem(
        LOCAL_PRODUCTS_KEY,
        JSON.stringify(products)
    );

}

// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    const savedProducts = loadSavedProducts();

    if (savedProducts.length > 0) {

        products = savedProducts;

        displayProducts();

    }

    try {

        const response =
            await fetch(`${CONFIG.API_URL}?action=getProducts`);

        const data = await response.json();

        if (data.success) {

            products = data.products;

            saveProductsLocally();

            displayProducts();

        }

    } catch (error) {

        console.error(error);

        if (products.length === 0) {

            showDemoProducts();

        }

    }

}

// ===============================
// DEMO PRODUCTS
// ===============================

function showDemoProducts() {

    products = [

        {
            code: 'KC001',
            name: 'Luxury Gold Keychain',
            price: 499,
            oldPrice: 699,

            image:
                'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80',

            tag: 'BESTSELLER'
        },

        {
            code: 'KC002',
            name: 'Elite Platinum Edition',
            price: 799,

            image:
                'https://images.unsplash.com/photo-1523381212067-4b5d7d2c97f6?auto=format&fit=crop&w=800&q=80',

            tag: 'PREMIUM'
        }

    ];

    saveProductsLocally();

    displayProducts();

}

// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts() {

    const grid =
        document.getElementById('productsGrid');

    if (products.length === 0) {

        grid.innerHTML =
            `<div class="loading">
                No Products Found
            </div>`;

        return;

    }

    grid.innerHTML = products.map(product => `

        <div class="product-card">

            <div class="shine"></div>

            ${product.tag ? `
                <div class="product-tag">
                    ${product.tag}
                </div>
            ` : ''}

            <div class="product-image-container">

                <img
                    src="${convertDriveUrl(product.image)}"
                    class="product-image"
                    alt="${product.name}"
                >

            </div>

            <div class="product-info">

                <div class="product-code">
                    ${product.code}
                </div>

                <div class="product-name">
                    ${product.name}
                </div>

                <div class="product-price">

                    <span class="price-current">
                        ₹${product.price}
                    </span>

                    ${product.oldPrice ? `
                        <span class="price-old">
                            ₹${product.oldPrice}
                        </span>
                    ` : ''}

                </div>

                <button
                    class="customize-btn"
                    onclick="showCustomize('${product.code}')"
                >

                    <i class="fas fa-crown"></i>

                    Customize & Add

                </button>

            </div>

        </div>

    `).join('');

    setTimeout(() => {

        animateProductCards();

    }, 100);

}

// ===============================
// ANIMATIONS
// ===============================

function initAnimations() {

    gsap.from('.hero-title', {

        y: 60,
        opacity: 0,
        duration: 1

    });

    gsap.from('.product-card', {

        y: 40,
        opacity: 0,
        stagger: 0.1

    });

}

function animateProductCards() {

    document.querySelectorAll('.product-card')
        .forEach(card => {

            card.addEventListener(
                'mousemove',
                onCardMouseMove
            );

            card.addEventListener(
                'mouseleave',
                onCardMouseLeave
            );

        });

}

function onCardMouseMove(e) {

    const card = e.currentTarget;

    const rect =
        card.getBoundingClientRect();

    const x =
        (e.clientX - rect.left) / rect.width;

    const y =
        (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 18;

    const rotateX = (0.5 - y) * 14;

    card.style.transform =
        `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.03)
        `;

}

function onCardMouseLeave(e) {

    e.currentTarget.style.transform =
        'perspective(1000px) rotateX(0) rotateY(0) scale(1)';

}

// ===============================
// CUSTOMIZE PRODUCT
// ===============================

function showCustomize(productCode) {

    currentProduct =
        products.find(
            p => p.code === productCode
        );

    if (!currentProduct) return;

    document.getElementById(
        'customizeProductInfo'
    ).innerHTML = `

        <img
            src="${convertDriveUrl(currentProduct.image)}"
            class="customize-product-image"
        >

        <div class="customize-product-name">
            ${currentProduct.name}
        </div>

        <div class="customize-product-price">
            ₹${currentProduct.price}
        </div>

    `;

    openModal('customizeModal');

}

// ===============================
// ADD TO CART
// ===============================

function addToCart() {

    const customText =
        document.getElementById('customText')
        .value
        .trim();

    if (!customText) {

        alert('Enter Custom Name');

        return;

    }

    const existing = cart.find(

        item =>
            item.code === currentProduct.code &&
            item.customText === customText

    );

    if (existing) {

        existing.qty++;

    } else {

        cart.push({

            ...currentProduct,

            customText,

            qty: 1,

            id: Date.now()

        });

    }

    saveCart();

    updateCartCount();

    closeModal('customizeModal');

    toggleCart(true);

}

// ===============================
// DISPLAY CART
// ===============================

function displayCart() {

    const cartItems =
        document.getElementById('cartItems');

    const totalAmount =
        document.getElementById('totalAmount');

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                Your Cart Is Empty
            </div>
        `;

        totalAmount.innerText = '₹0';

        return;

    }

    cartItems.innerHTML = cart.map(item => `

        <div class="cart-item">

            <div class="cart-item-header">

                <div>

                    <div class="cart-item-name">
                        ${item.name}
                    </div>

                    <div class="cart-item-custom">
                        ${item.customText}
                    </div>

                </div>

                <button
                    class="remove-item"
                    onclick="removeFromCart(${item.id})"
                >
                    ✕
                </button>

            </div>

            <div class="cart-item-controls">

                <div class="quantity-controls">

                    <button
                        class="qty-btn"
                        onclick="changeQuantity(${item.id},-1)"
                    >
                        -
                    </button>

                    <span class="qty-value">
                        ${item.qty}
                    </span>

                    <button
                        class="qty-btn"
                        onclick="changeQuantity(${item.id},1)"
                    >
                        +
                    </button>

                </div>

                <div class="cart-item-price">

                    ₹${item.price * item.qty}

                </div>

            </div>

        </div>

    `).join('');

    const total = cart.reduce(

        (sum, item) =>
            sum + (item.price * item.qty),

        0

    );

    totalAmount.innerText = `₹${total}`;

}

// ===============================
// TOGGLE CART
// ===============================

function toggleCart(forceState = null) {

    const sidebar =
        document.getElementById('cartSidebar');

    const overlay =
        document.getElementById('overlay');

    let isOpen;

    if (forceState !== null) {

        isOpen = forceState;

        if (isOpen) {

            sidebar.classList.add('active');

            overlay.classList.add('active');

            displayCart();

        } else {

            sidebar.classList.remove('active');

            overlay.classList.remove('active');

        }

        return;

    }

    isOpen =
        sidebar.classList.toggle('active');

    if (isOpen) {

        overlay.classList.add('active');

        displayCart();

    } else {

        overlay.classList.remove('active');

    }

}

// ===============================
// PLACE ORDER
// ===============================

function placeOrder() {

    if (cart.length === 0) {

        alert('Cart Empty');

        return;

    }

    let message =
        '🛒 *THENNU ARTIST ORDER*%0A%0A';

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.qty;

        message +=
            `✨ ${item.name}%0A` +
            `Custom: ${item.customText}%0A` +
            `Qty: ${item.qty}%0A` +
            `Price: ₹${item.price * item.qty}%0A%0A`;

    });

    message += `💰 Total: ₹${total}`;

    const phone =
        CONFIG.WHATSAPP_NUMBER;

    const url =
        `https://wa.me/${phone}?text=${message}`;

    window.open(url, '_blank');

}

// ===============================
// CART HELPERS
// ===============================

function removeFromCart(id) {

    cart =
        cart.filter(item => item.id !== id);

    saveCart();

    updateCartCount();

    displayCart();

}

function changeQuantity(id, delta) {

    const item =
        cart.find(i => i.id === id);

    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {

        removeFromCart(id);

        return;

    }

    saveCart();

    displayCart();

}

function updateCartCount() {

    document.querySelector('.cart-count')
        .innerText = cart.length;

}

function saveCart() {

    localStorage.setItem(
        'thennuCart',
        JSON.stringify(cart)
    );

}

function loadCart() {

    const saved =
        localStorage.getItem('thennuCart');

    if (saved) {

        cart = JSON.parse(saved);

    }

}

// ===============================
// HERO CAROUSEL
// ===============================

function startHeroCarousel() {

    const hero =
        document.querySelector('.hero');

    if (!hero) return;

    hero.style.backgroundImage =
        `url('${HERO_IMAGES[0]}')`;

    heroTimer = setInterval(() => {

        heroIndex =
            (heroIndex + 1) %
            HERO_IMAGES.length;

        hero.style.backgroundImage =
            `url('${HERO_IMAGES[heroIndex]}')`;

    }, 5000);

}

// ===============================
// LOGO
// ===============================

function loadLogo() {

    const url =
        localStorage.getItem('thennuLogo');

    if (url) {

        document.getElementById(
            'brandLogoImg'
        ).src = url;

    }

}

// ===============================
// MODALS
// ===============================

function openModal(id) {

    document.getElementById(id)
        .classList.add('active');

    document.getElementById('overlay')
        .classList.add('active');

}

function closeModal(id) {

    document.getElementById(id)
        .classList.remove('active');

}

function closeAllModals() {

    document.querySelectorAll('.modal')
        .forEach(modal => {

            modal.classList.remove('active');

        });

    document.getElementById('overlay')
        .classList.remove('active');

}

// ===============================
// UTILITIES
// ===============================

function convertDriveUrl(url) {

    if (!url) {

        return
            'https://via.placeholder.com/300';

    }

    const match =
        url.match(/\/d\/(.*?)\//);

    if (match) {

        return
            `https://drive.google.com/uc?id=${match[1]}`;

    }

    return url;

}

function scrollToProducts() {

    document.getElementById('products')
        .scrollIntoView({

            behavior: 'smooth'

        });

}

// ===============================
// REVIEWS
// ===============================

function loadReviews() {

    const saved =
        localStorage.getItem(REVIEWS_KEY);

    const reviews =
        saved ? JSON.parse(saved) : [];

    const grid =
        document.getElementById('reviewsGrid');

    if (!grid) return;

    grid.innerHTML = reviews.map(review => `

        <div class="review-card">

            <div class="review-stars">
                ${'★'.repeat(review.stars)}
            </div>

            <p class="review-text">
                ${review.text}
            </p>

            <div class="review-author">
                - ${review.author}
            </div>

        </div>

    `).join('');

}