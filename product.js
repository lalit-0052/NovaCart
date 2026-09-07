const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const loadingEl = document.getElementById('loadingState');
const errorEl = document.getElementById('errorState');
const detailEl = document.getElementById('productDetail');

const qtyInput = document.getElementById('qtyInput');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const addBtn = document.getElementById('addToCartBtn');

let currentProduct = null;


// ======================================
// LOAD PRODUCT
// ======================================

async function loadProduct() {

  if (!productId) {
    showError(
      'No product was selected. Go back and choose a product.'
    );
    return;
  }

  loadingEl.hidden = false;
  errorEl.hidden = true;
  detailEl.hidden = true;

  try {

    const response = await fetch(
      `https://dummyjson.com/products/${productId}`
    );

    if (!response.ok) {
      throw new Error('Product not found');
    }

    currentProduct = await response.json();

    renderProduct(currentProduct);

  } catch (error) {

    console.error(error);

    showError(
      'Could not load this product. Please check your connection and try again.'
    );

  } finally {

    loadingEl.hidden = true;

  }

}


// ======================================
// SHOW ERROR
// ======================================

function showError(message) {

  loadingEl.hidden = true;

  errorEl.hidden = false;

  errorEl.textContent = message;

}


// ======================================
// RENDER PRODUCT
// ======================================

function renderProduct(product) {

  detailEl.hidden = false;

 document.title = `${p.title} · NovaCart`;


  // --------------------------------------
  // PRODUCT GALLERY
  // --------------------------------------

  const images =
    product.images?.length
      ? product.images
      : [product.thumbnail];


  const mainImage =
    document.getElementById('mainImage');


  mainImage.src = images[0];

  mainImage.alt = product.title;


  const thumbStrip =
    document.getElementById('thumbStrip');


  thumbStrip.innerHTML = '';


  images.forEach((image, index) => {

    const thumbnail =
      document.createElement('img');


    thumbnail.src = image;

    thumbnail.alt =
      `${product.title} image ${index + 1}`;


    thumbnail.className =
      `thumb ${index === 0 ? 'active' : ''}`;


    thumbnail.loading = 'lazy';


    thumbnail.addEventListener('click', () => {

      mainImage.src = image;


      thumbStrip
        .querySelectorAll('.thumb')
        .forEach((thumb) => {

          thumb.classList.remove('active');

        });


      thumbnail.classList.add('active');

    });


    thumbStrip.appendChild(thumbnail);

  });


  // --------------------------------------
  // PRODUCT INFORMATION
  // --------------------------------------

  document.getElementById(
    'breadcrumbCategory'
  ).textContent = formatCategory(product.category);


  document.getElementById(
    'productTitle'
  ).textContent = product.title;


  document.getElementById(
    'productBrand'
  ).textContent =
    product.brand
      ? `by ${product.brand}`
      : '';


  document.getElementById(
    'productRating'
  ).textContent =
    `⭐ ${Number(product.rating).toFixed(1)} rating · ${
      product.reviews?.length ?? 0
    } reviews`;


  document.getElementById(
    'productDescription'
  ).textContent =
    product.description;


  // --------------------------------------
  // PRICE
  // --------------------------------------

  const hasDiscount =
    Number(product.discountPercentage) > 0;


  const originalPrice =
    hasDiscount
      ? product.price /
        (1 - product.discountPercentage / 100)
      : null;


  document.getElementById(
    'productPrice'
  ).textContent =
    `$${Number(product.price).toFixed(2)}`;


  const originalPriceEl =
    document.getElementById('productOriginalPrice');


  const discountEl =
    document.getElementById('productDiscountBadge');


  if (hasDiscount) {

    originalPriceEl.textContent =
      `$${originalPrice.toFixed(2)}`;

    originalPriceEl.hidden = false;


    discountEl.textContent =
      `${Math.round(product.discountPercentage)}% OFF`;

    discountEl.hidden = false;

  } else {

    originalPriceEl.hidden = true;

    discountEl.hidden = true;

  }


  // --------------------------------------
  // STOCK
  // --------------------------------------

  const stockEl =
    document.getElementById('productStock');


  const isAvailable =
    product.stock > 0;


  if (isAvailable) {

    if (product.availabilityStatus === 'Low Stock') {

      stockEl.textContent =
        `🔥 Only ${product.stock} left in stock!`;

    } else {

      stockEl.textContent =
        `✓ In stock — ${product.stock} available`;

    }


    stockEl.className =
      'stock-msg in-stock';

  } else {

    stockEl.textContent =
      '✕ Out of stock';

    stockEl.className =
      'stock-msg out-stock';

  }


  // --------------------------------------
  // PRODUCT META INFORMATION
  // --------------------------------------

  document.getElementById(
    'productWarranty'
  ).textContent =
    product.warrantyInformation ||
    'Standard warranty applies';


  document.getElementById(
    'productShipping'
  ).textContent =
    product.shippingInformation ||
    'Standard shipping available';


  document.getElementById(
    'productReturn'
  ).textContent =
    product.returnPolicy ||
    'Returns accepted within 30 days';


  document.getElementById(
    'productSku'
  ).textContent =
    product.sku || '—';


  // --------------------------------------
  // QUANTITY SETUP
  // --------------------------------------

  qtyInput.value = 1;

  qtyInput.max =
    isAvailable
      ? product.stock
      : 1;


  addBtn.disabled = !isAvailable;

  addBtn.textContent =
    isAvailable
      ? '🛒 Add to Cart'
      : 'Out of Stock';


  updateQuantityButtons();

}


// ======================================
// QUANTITY CONTROLS
// ======================================

qtyMinus.addEventListener('click', () => {

  const currentQty =
    Number(qtyInput.value);


  if (currentQty > 1) {

    qtyInput.value =
      currentQty - 1;

  }


  updateQuantityButtons();

});


qtyPlus.addEventListener('click', () => {

  const currentQty =
    Number(qtyInput.value);

  const maxQty =
    Number(qtyInput.max);


  if (currentQty < maxQty) {

    qtyInput.value =
      currentQty + 1;

  }


  updateQuantityButtons();

});


// ======================================
// UPDATE QUANTITY BUTTONS
// ======================================

function updateQuantityButtons() {

  const quantity =
    Number(qtyInput.value);

  const max =
    Number(qtyInput.max);


  qtyMinus.disabled =
    quantity <= 1;


  qtyPlus.disabled =
    quantity >= max;

}


// ======================================
// ADD TO CART
// ======================================

addBtn.addEventListener('click', () => {

  if (!currentProduct) return;


  const quantity =
    Number(qtyInput.value);


  // Safety check

  if (
    quantity < 1 ||
    quantity > currentProduct.stock
  ) {
    return;
  }


  addToCart(
    currentProduct,
    quantity
  );


  const originalText =
    addBtn.textContent;


  addBtn.textContent =
    '✓ Added to Cart';


  addBtn.disabled = true;


  setTimeout(() => {

    addBtn.textContent =
      originalText;


    addBtn.disabled = false;


    updateQuantityButtons();

  }, 1200);

});


// ======================================
// FORMAT CATEGORY
// ======================================

function formatCategory(category = '') {

  return category
    .split('-')
    .map((word) => {

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );

    })
    .join(' ');

}


// ======================================
// START
// ======================================

loadProduct();