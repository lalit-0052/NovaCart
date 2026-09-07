const PRODUCTS_API = 'https://dummyjson.com/products?limit=194';

const gridEl = document.getElementById('productGrid');
const loadingEl = document.getElementById('loadingState');
const errorEl = document.getElementById('errorState');
const searchInput = document.getElementById('searchInput');
const resultCountEl = document.getElementById('resultCount');

let allProducts = [];
let selectedCategory = 'all';


// ================================
// LOAD PRODUCTS
// ================================

async function loadProducts() {

  loadingEl.hidden = false;
  errorEl.hidden = true;

  try {

    const response = await fetch(PRODUCTS_API);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    console.log('Products received:', data);

    allProducts = data.products || [];

    renderFilteredProducts();

  } catch (error) {

    console.error('Error loading products:', error);

    errorEl.hidden = false;

    errorEl.textContent =
      'Could not load products. Please check your internet connection and refresh the page.';

  } finally {

    loadingEl.hidden = true;

  }

}


// ================================
// FILTER PRODUCTS
// ================================

function renderFilteredProducts() {

  const searchTerm =
    searchInput.value
      .trim()
      .toLowerCase();


  let filteredProducts = [...allProducts];


 // CATEGORY FILTER

if (selectedCategory !== 'all') {

  filteredProducts = filteredProducts.filter((product) => {

    const category = (product.category || '').toLowerCase();


    // 📱 ELECTRONICS
    if (selectedCategory === 'electronics') {

      return [
        'smartphones',
        'laptops',
        'tablets',
        'mobile-accessories'
      ].includes(category);

    }


    // 👕 FASHION
    if (selectedCategory === 'fashion') {

      return [
        'mens-shirts',
        'mens-shoes',
        'mens-watches',
        'womens-bags',
        'womens-dresses',
        'womens-jewellery',
        'womens-shoes',
        'womens-watches',
        'tops'
      ].includes(category);

    }


    // 👜 ACCESSORIES
    if (selectedCategory === 'accessories') {

      return [
        'beauty',
        'fragrances',
        'skin-care',
        'sunglasses',
        'womens-bags'
      ].includes(category);

    }


    return true;

  });

}


  // SEARCH FILTER

  if (searchTerm) {

    filteredProducts =
      filteredProducts.filter((product) => {

        return (

          product.title
            .toLowerCase()
            .includes(searchTerm)

          ||

          (product.category || '')
            .toLowerCase()
            .includes(searchTerm)

          ||

          (product.brand || '')
            .toLowerCase()
            .includes(searchTerm)

        );

      });

  }


  renderProducts(filteredProducts);

}


// ================================
// RENDER PRODUCTS
// ================================

function renderProducts(products) {

  resultCountEl.textContent =
    `${products.length} product${products.length === 1 ? '' : 's'} found`;


  gridEl.innerHTML = '';


  // EMPTY STATE

  if (products.length === 0) {

    gridEl.innerHTML = `

      <div class="no-products">

        <h2>No products found 😳</h2>

        <p>
          Try searching for something else.
        </p>

      </div>

    `;

    return;

  }


  const fragment =
    document.createDocumentFragment();


  products.forEach((product) => {

    const card =
      document.createElement('article');


    card.className =
      'product-card';


    const hasDiscount =
      product.discountPercentage > 0;


    card.innerHTML = `

      <div class="card-image-wrap">

        <img
          src="${product.thumbnail}"
          alt="${escapeHtml(product.title)}"
          loading="lazy"
        />

        ${
          hasDiscount
            ? `
              <span class="discount-badge">
                -${Math.round(product.discountPercentage)}%
              </span>
            `
            : ''
        }

      </div>


      <div class="card-body">

        <p class="card-category">
          ${escapeHtml(product.category)}
        </p>


        <h3 class="card-title">
          ${escapeHtml(product.title)}
        </h3>


        <div class="card-rating">
          ⭐ ${Number(product.rating).toFixed(1)}
        </div>


        <div class="card-price-row">

          <span class="card-price">
            $${Number(product.price).toFixed(2)}
          </span>

        </div>


        <button
          class="btn-add-cart"
          type="button"
        >
          Add to Cart
        </button>

      </div>

    `;


    // PRODUCT PAGE

    card.addEventListener('click', () => {

      window.location.href =
        `product.html?id=${product.id}`;

    });


    // ADD TO CART

    const addButton =
      card.querySelector('.btn-add-cart');


    addButton.addEventListener('click', (event) => {

      event.stopPropagation();

      addToCart(product, 1);

      flashAdded(addButton);

    });


    fragment.appendChild(card);

  });


  gridEl.appendChild(fragment);

}


// ================================
// SEARCH
// ================================

let searchDebounce;


searchInput.addEventListener('input', () => {

  clearTimeout(searchDebounce);


  searchDebounce =
    setTimeout(() => {

      renderFilteredProducts();

    }, 200);

});


// ================================
// CATEGORY BUTTONS
// ================================

const categoryButtons =
  document.querySelectorAll('.category-btn');


categoryButtons.forEach((button) => {

  button.addEventListener('click', () => {

    categoryButtons.forEach((btn) => {

      btn.classList.remove('active');

    });


    button.classList.add('active');


    selectedCategory =
      button.dataset.category;


    renderFilteredProducts();

  });

});


// ================================
// ADD CART ANIMATION
// ================================

function flashAdded(button) {

  const originalText =
    button.textContent;


  button.textContent =
    'Added ✓';


  button.disabled = true;


  setTimeout(() => {

    button.textContent =
      originalText;

    button.disabled = false;

  }, 900);

}


// ================================
// SAFE HTML
// ================================

function escapeHtml(str = '') {

  const div =
    document.createElement('div');


  div.textContent = str;


  return div.innerHTML;

}


// ================================
// START
// ================================

loadProducts();