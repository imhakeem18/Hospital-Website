// == DOM ELEMENTS ==

// Modal, buttons, and cart table elements
const modal = document.getElementById("cartModal");
const btn = document.getElementById("viewCartBtn");
const closeBtn = document.querySelector(".close");
const cartItemsContainer = document.getElementById("cartItems");
const addToFavouritesBtn = document.getElementById("addToFavouritesBtn");
const applyFavouritesBtn = document.getElementById("applyFavouritesBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.querySelector(".checkout-btn");

// Search bar functionality
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", filterProducts);


// Favourites storage (using localStorage)
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

// == MODAL MANAGEMENT ==

// Open and close modal
btn.onclick = () => (modal.style.display = "block");
closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
};

// == FAVORITES MANAGEMENT ==

// Sanitize product name to avoid invalid selectors
function sanitizeName(name) {
    return name.trim();
}

// Add all cart items to Favourites functionality
addToFavouritesBtn.onclick = () => {
    const cartItems = [];
    document.querySelectorAll("#cartItems tr").forEach(row => {
        const productName = sanitizeName(row.querySelector("td:first-child").textContent);
        const quantity = parseInt(row.querySelector(".cart-quantity-input").value);
        const price = parseFloat(row.querySelector("td:nth-child(3)").textContent);

        cartItems.push({ name: productName, quantity, price });
    });

    if (cartItems.length === 0) {
        alert("You can't add an empty cart to favourites.");
        return;
    }

    // Save to localStorage
    localStorage.setItem("favourites", JSON.stringify(cartItems));
    alert("All items in the cart have been added to your favourites.");
};

// Apply Favourites functionality
applyFavouritesBtn.onclick = () => {
    // Load favourites from localStorage
    favourites = JSON.parse(localStorage.getItem("favourites")) || [];

    if (favourites.length === 0) {
        alert("No favourites to apply.");
        return;
    }

    // Clear the current cart first
    cartItemsContainer.innerHTML = '';

    // Apply each item from favourites to the cart
    favourites.forEach(favProduct => {
        const { name, quantity, price } = favProduct;
        const sanitizedName = sanitizeName(name);

        // Check if the item already exists in the cart
        const existingRow = document.querySelector(`#cartItems tr[data-product="${sanitizedName}"]`);
        
        if (!existingRow) {
            cartItemsContainer.innerHTML += `
                <tr data-product="${sanitizedName}">
                    <td>${sanitizedName}</td>
                    <td class="quantity-controls">
                        <button class="decrease-cart">-</button>
                        <input type="number" class="cart-quantity-input" value="${quantity}" min="1">
                        <button class="increase-cart">+</button>
                    </td>
                    <td>${price.toFixed(2)}</td>
                    <td class="cart-total">${(quantity * price).toFixed(2)}</td>
                    <td>
                        <button class="remove-item">
                            <img src="images/Medicines/Trash can icon.png" alt="Remove" class="trash-icon">
                        </button>
                    </td>
                </tr>`;
        }
    });

    updateCartListeners();
    updateCartTotal();
    saveCartToLocalStorage();
    alert("Favourites applied to cart.");
};

// == CART MANAGEMENT ==

// Clear Cart functionality
clearCartBtn.onclick = () => {
    cartItemsContainer.innerHTML = '';
    updateCartTotal();
    saveCartToLocalStorage();
};

// Save cart to localStorage
function saveCartToLocalStorage() {
    const cartData = [];
    document.querySelectorAll("#cartItems tr").forEach(row => {
        const productName = sanitizeName(row.querySelector("td:first-child").textContent);
        const quantity = parseInt(row.querySelector(".cart-quantity-input").value);
        const price = parseFloat(row.querySelector("td:nth-child(3)").textContent);

        cartData.push({ name: productName, quantity, price });
    });
    localStorage.setItem("cart", JSON.stringify(cartData));
}

// == PRODUCT LOADING ==

// Load products dynamically
async function loadProducts() {
    const response = await fetch('products.json');
    const categories = await response.json();

    const container = document.getElementById('products-container');
    container.innerHTML = '';

    categories.forEach(category => {
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-names';
        categoryTitle.innerHTML = `<h2>${category.category}</h2>`;
        container.appendChild(categoryTitle);

        const productContainer = document.createElement('div');
        productContainer.className = 'products';
        container.appendChild(productContainer);

        category.products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product';
            productItem.innerHTML = `
                <img src="${product.image}" alt="${product.alt}">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="price">${product.price}</p>
                    <div class="quantity-selector">
                        <button class="decrease">-</button>
                        <input class="quantity" type="number" min="1" value="1" aria-label="Quantity">
                        <button class="increase">+</button>
                    </div>
                    <button class="add-to-cart">Add to cart</button>
                </div>
            `;
            productContainer.appendChild(productItem);
        });
    });

    attachProductListeners();
}



// Attach listeners to product list
function attachProductListeners() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const productInfo = button.parentElement;
            const productName = sanitizeName(productInfo.querySelector("h3").textContent);
            const productPrice = parseFloat(productInfo.querySelector(".price").textContent.replace('Rs. ', '').replace(/,/g, ''));
            const quantity = parseInt(productInfo.querySelector(".quantity").value);

            const existingRow = document.querySelector(`#cartItems tr[data-product="${productName}"]`);
            if (existingRow) {
                const quantityInput = existingRow.querySelector(".cart-quantity-input");
                quantityInput.value = parseInt(quantityInput.value) + quantity;
                updateRowTotal(existingRow, productPrice);
            } else {
                cartItemsContainer.innerHTML += `
                    <tr data-product="${productName}">
                        <td>${productName}</td>
                        <td class="quantity-controls">
                            <button class="decrease-cart">-</button>
                            <input type="number" class="cart-quantity-input" value="${quantity}" min="1">
                            <button class="increase-cart">+</button>
                        </td>
                        <td>${productPrice.toFixed(2)}</td>
                        <td class="cart-total">${(quantity * productPrice).toFixed(2)}</td>
                        <td>
                            <button class="remove-item">
                                <img src="images/Medicines/Trash can icon.png" alt="Remove" class="trash-icon">
                            </button>
                        </td>
                    </tr>`;
                updateCartListeners();
            }

            saveCartToLocalStorage();
            updateCartTotal();
            showToast(`${productName} has been added to your cart.`);
        });
    });

    document.querySelectorAll(".quantity-selector").forEach(selector => {
        const decreaseBtn = selector.querySelector(".decrease");
        const increaseBtn = selector.querySelector(".increase");
        const quantityInput = selector.querySelector(".quantity");

        decreaseBtn.onclick = () => {
            if (quantityInput.value > 1) quantityInput.value--;
        };

        increaseBtn.onclick = () => quantityInput.value++;
    });
}

// == CART INTERACTION ==

// Attach listeners to cart rows
function updateCartListeners() {
    document.querySelectorAll("#cartItems tr").forEach(row => {
        const quantityInput = row.querySelector(".cart-quantity-input");
        const decreaseBtn = row.querySelector(".decrease-cart");
        const increaseBtn = row.querySelector(".increase-cart");
        const productPrice = parseFloat(row.querySelector("td:nth-child(3)").textContent);

        decreaseBtn.onclick = () => {
            if (quantityInput.value > 1) {
                quantityInput.value--;
                updateRowTotal(row, productPrice);
            }
        };

        increaseBtn.onclick = () => {
            quantityInput.value++;
            updateRowTotal(row, productPrice);
        };

        row.querySelector(".remove-item").onclick = () => {
            row.remove();
            updateCartTotal();
            saveCartToLocalStorage();
        };
    });
}

// Update row total
function updateRowTotal(row, productPrice) {
    const quantity = row.querySelector(".cart-quantity-input").value;
    row.querySelector(".cart-total").textContent = (quantity * productPrice).toFixed(2);
    updateCartTotal();
}

// Update cart total
function updateCartTotal() {
    let total = 0;
    document.querySelectorAll(".cart-total").forEach(totalCell => {
        total += parseFloat(totalCell.textContent);
    });
    document.querySelector(".checkout-btn").textContent = `Checkout - Total: Rs. ${total.toFixed(2)}`;
}

// == SEARCH FUNCTIONALITY ==

// Search bar filter
function filterProducts() {
    const query = searchInput.value.toLowerCase();
    const productItems = document.querySelectorAll('.product');
    productItems.forEach(item => {
        const productName = item.querySelector('.product-name').textContent.toLowerCase();
        if (productName.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// == CHECKOUT FUNCTIONALITY ==

// Handle checkout button click
checkoutBtn.onclick = () => {
    const cartItems = [];
    document.querySelectorAll("#cartItems tr").forEach(row => {
        const productName = sanitizeName(row.querySelector("td:first-child").textContent);
        const quantity = parseInt(row.querySelector(".cart-quantity-input").value);
        const price = parseFloat(row.querySelector("td:nth-child(3)").textContent);

        cartItems.push({ name: productName, quantity, price });
    });

    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add some items to the cart before proceeding to checkout.");
        return;
    }

    alert("Proceeding to checkout...");
    window.location.href = 'checkout.html'; 
};

// == TOAST NOTIFICATIONS ==

// Show toast notification
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// == INITIALIZATION ==

// Load products on page ready
loadProducts();
