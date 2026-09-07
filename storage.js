const CART_KEY = 'novacart_cart';


// ======================================
// GET CART
// ======================================

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);

    const cart = raw ? JSON.parse(raw) : [];

    return Array.isArray(cart) ? cart : [];

  } catch (error) {
    console.error('Failed to read cart from storage:', error);

    return [];
  }
}


// ======================================
// SAVE CART
// ======================================

function saveCart(cart) {
  try {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

    updateCartBadge(true);

  } catch (error) {
    console.error('Failed to save cart:', error);
  }
}


// ======================================
// ADD TO CART
// ======================================

function addToCart(product, qty = 1) {

  if (!product || !product.id) {
    console.error('Invalid product');

    return;
  }


  const cart = getCart();

  const maxQty = Number(product.stock) || 99;

  const quantityToAdd = Math.max(
    1,
    Number(qty) || 1
  );


  const existingItem = cart.find(
    (item) => item.id === product.id
  );


  if (existingItem) {

    existingItem.quantity = Math.min(
      existingItem.quantity + quantityToAdd,
      existingItem.stock || maxQty
    );

  } else {

    cart.push({

      id: product.id,

      title: product.title || 'Unknown Product',

      thumbnail: product.thumbnail || '',

      price: Number(product.price) || 0,

      discountPercentage:
        Number(product.discountPercentage) || 0,

      stock: maxQty,

      quantity: Math.min(
        quantityToAdd,
        maxQty
      )

    });

  }


  saveCart(cart);

}


// ======================================
// REMOVE FROM CART
// ======================================

function removeFromCart(id) {

  const cart = getCart().filter(
    (item) => item.id !== Number(id)
  );


  saveCart(cart);

}


// ======================================
// UPDATE QUANTITY
// ======================================

function updateCartQuantity(id, qty) {

  const cart = getCart();


  const item = cart.find(
    (item) => item.id === Number(id)
  );


  if (!item) return;


  const maxStock =
    Number(item.stock) || 99;


  const newQuantity = Math.max(
    1,
    Math.min(
      Number(qty) || 1,
      maxStock
    )
  );


  item.quantity = newQuantity;


  saveCart(cart);

}


// ======================================
// GET TOTAL CART ITEMS
// ======================================

function getCartCount() {

  return getCart().reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0),
    0
  );

}


// ======================================
// GET CART TOTAL
// ======================================

function getCartTotal() {

  return getCart().reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
      (Number(item.quantity) || 0),
    0
  );

}


// ======================================
// CLEAR CART
// ======================================

function clearCart() {

  localStorage.removeItem(CART_KEY);

  updateCartBadge(true);

}


// ======================================
// UPDATE CART BADGE
// ======================================

function updateCartBadge(animate = false) {

  const badge =
    document.getElementById('cartBadge');


  if (!badge) return;


  const count =
    getCartCount();


  badge.textContent = count;


  // Hide badge when cart is empty

  badge.style.display =
    count > 0
      ? 'inline-flex'
      : 'none';


  if (animate && count > 0) {

    badge.classList.remove('bump');


    // Restart animation

    void badge.offsetWidth;


    badge.classList.add('bump');


    setTimeout(() => {

      badge.classList.remove('bump');

    }, 250);

  }

}


// ======================================
// INITIALIZE CART BADGE
// ======================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    updateCartBadge(false);

  }
);