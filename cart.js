const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;


// ======================================
// DOM ELEMENTS
// ======================================

const cartItemsEl = document.getElementById('cartItems');
const emptyStateEl = document.getElementById('emptyState');
const cartContentEl = document.getElementById('cartContent');

const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');


// ======================================
// RENDER CART
// ======================================

function renderCart() {

  const cart = getCart();


  // EMPTY CART

  if (cart.length === 0) {

    cartContentEl.hidden = true;

    emptyStateEl.hidden = false;

    return;

  }


  // SHOW CART

  emptyStateEl.hidden = true;

  cartContentEl.hidden = false;

  cartItemsEl.innerHTML = '';


  cart.forEach((item) => {

    const hasDiscount =
      Number(item.discountPercentage) > 0;


    const originalPrice =
      hasDiscount
        ? item.price /
          (1 - item.discountPercentage / 100)
        : null;


    const isMaxStock =
      item.quantity >= item.stock;


    const row = document.createElement('div');

    row.className = 'cart-row';


    row.innerHTML = `

      <!-- PRODUCT IMAGE -->

      <img
        src="${item.thumbnail}"
        alt="${escapeHtml(item.title)}"
        class="cart-item-img"
      />


      <!-- PRODUCT INFO -->

      <div class="cart-item-info">

        <h4>
          ${escapeHtml(item.title)}
        </h4>


        <div class="cart-item-price">

          $${Number(item.price).toFixed(2)}

          ${
            originalPrice
              ? `
                <span class="strike">
                  $${originalPrice.toFixed(2)}
                </span>
              `
              : ''
          }

        </div>

      </div>


      <!-- QUANTITY -->

      <div class="qty-control">

        <button
          class="qty-btn"
          data-action="dec"
          data-id="${item.id}"
          aria-label="Decrease quantity"
        >
          −
        </button>


        <span class="qty-value">
          ${item.quantity}
        </span>


        <button
          class="qty-btn"
          data-action="inc"
          data-id="${item.id}"
          aria-label="Increase quantity"
          ${isMaxStock ? 'disabled' : ''}
        >
          +
        </button>

      </div>


      <!-- TOTAL -->

      <div class="cart-item-total">

        $${(item.price * item.quantity).toFixed(2)}

      </div>


      <!-- REMOVE -->

      <button
        class="remove-btn"
        data-id="${item.id}"
        aria-label="Remove item"
      >
        ✕
      </button>

    `;


    cartItemsEl.appendChild(row);

  });


  attachRowEvents();

  renderSummary(cart);

}


// ======================================
// CART BUTTON EVENTS
// ======================================

function attachRowEvents() {

  const quantityButtons =
    cartItemsEl.querySelectorAll('.qty-btn');


  quantityButtons.forEach((button) => {

    button.addEventListener('click', () => {

      const id =
        Number(button.dataset.id);


      const action =
        button.dataset.action;


      const cart =
        getCart();


      const item =
        cart.find(
          (product) => product.id === id
        );


      if (!item) return;


      // INCREASE

      if (action === 'inc') {

        if (item.quantity < item.stock) {

          updateCartQuantity(
            id,
            item.quantity + 1
          );

        }

      }


      // DECREASE

      if (action === 'dec') {

        if (item.quantity > 1) {

          updateCartQuantity(
            id,
            item.quantity - 1
          );

        } else {

          removeFromCart(id);

        }

      }


      renderCart();

    });

  });


  // REMOVE BUTTON

  const removeButtons =
    cartItemsEl.querySelectorAll('.remove-btn');


  removeButtons.forEach((button) => {

    button.addEventListener('click', () => {

      const id =
        Number(button.dataset.id);


      removeFromCart(id);


      renderCart();

    });

  });

}


// ======================================
// BILL SUMMARY
// ======================================

function renderSummary(cart) {

  let subtotal = 0;

  let originalTotal = 0;


  cart.forEach((item) => {

    const price =
      Number(item.price) || 0;


    const quantity =
      Number(item.quantity) || 1;


    subtotal +=
      price * quantity;


    const discount =
      Number(item.discountPercentage) || 0;


    const originalPrice =
      discount > 0
        ? price /
          (1 - discount / 100)
        : price;


    originalTotal +=
      originalPrice * quantity;

  });


  // SAVINGS

  const savings =
    originalTotal - subtotal;


  // SHIPPING

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FEE;


  // TAX

  const tax =
    subtotal * TAX_RATE;


  // FINAL TOTAL

  const total =
    subtotal +
    shipping +
    tax;


  // ITEM COUNT

  const itemCount =
    cart.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );


  // UPDATE UI

  document.getElementById(
    'itemCount'
  ).textContent =
    `${itemCount} item${itemCount === 1 ? '' : 's'}`;


  document.getElementById(
    'summarySubtotal'
  ).textContent =
    `$${subtotal.toFixed(2)}`;


  // SAVINGS

  const savingsRow =
    document.getElementById('savingsRow');


  if (savings > 0.01) {

    savingsRow.hidden = false;


    document.getElementById(
      'summarySavings'
    ).textContent =
      `-$${savings.toFixed(2)}`;

  } else {

    savingsRow.hidden = true;

  }


  // SHIPPING

  const shippingEl =
    document.getElementById('summaryShipping');


  shippingEl.textContent =
    shipping === 0
      ? 'FREE 🎉'
      : `$${shipping.toFixed(2)}`;


  // SHIPPING MESSAGE

  const shippingNote =
    document.getElementById('shippingNote');


  if (shipping > 0) {

    const remaining =
      FREE_SHIPPING_THRESHOLD - subtotal;


    shippingNote.hidden = false;


    shippingNote.textContent =
      `🚚 Add $${remaining.toFixed(2)} more for FREE shipping!`;

  } else {

    shippingNote.hidden = false;


    shippingNote.textContent =
      '🎉 Congratulations! You unlocked FREE shipping.';

  }


  // TAX

  document.getElementById(
    'summaryTax'
  ).textContent =
    `$${tax.toFixed(2)}`;


  // TOTAL

  document.getElementById(
    'summaryTotal'
  ).textContent =
    `$${total.toFixed(2)}`;

}


// ======================================
// CLEAR CART
// ======================================

clearCartBtn?.addEventListener('click', () => {

  const confirmed =
    confirm(
      'Are you sure you want to remove all items from your cart?'
    );


  if (!confirmed) return;


  clearCart();


  renderCart();

});


// ======================================
// CHECKOUT
// ======================================

checkoutBtn.addEventListener('click', () => {

  const cart = getCart();


  if (cart.length === 0) {

    return;

  }


  const originalText =
    checkoutBtn.textContent;


  checkoutBtn.textContent =
    'Processing...';


  checkoutBtn.disabled = true;


  // Simulate checkout processing

  setTimeout(() => {

    alert(
      '🎉 Order placed successfully!\n\nThank you for shopping with ShopEase.'
    );


    clearCart();


    renderCart();


    checkoutBtn.textContent =
      originalText;


    checkoutBtn.disabled = false;

  }, 800);

});


// ======================================
// ESCAPE HTML
// ======================================

function escapeHtml(str = '') {

  const div =
    document.createElement('div');


  div.textContent = str;


  return div.innerHTML;

}


// ======================================
// INITIALIZE
// ======================================

renderCart();