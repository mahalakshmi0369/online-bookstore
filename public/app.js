/**
 * PageTurner Online Bookstore — Comprehensive Customer Journeys App
 * 
 * Customer Journeys Mapped:
 * E-store Home:
 * 1. Login Page / User Authentication
 * 2. User Browses Order History with Buy It Again feature / Recommends items based on Order History
 * 3. Access Product catalogue for each category
 * 
 * Catalogue:
 * 5. Select the Category of products
 * 6. Browse the brands (Publishers / Imprints)
 * 7. Select the product (tagged with tentative delivery date) / Related products appear for selection
 * 8. Add the product(s) to basket
 * 
 * Payment & Purchase confirmation:
 * 9. Select the address for delivery
 * 10. Initiate payment with the right option / Redeem gift points
 * 11. Payment confirmation
 * 12. Confirmation on purchase / Cancel Order Within 48 hrs
 */

class BookstoreApp {
  constructor() {
    this.currentUser = null;
    this.categories = [];
    this.brands = [];
    this.books = [];
    this.cart = JSON.parse(localStorage.getItem('pageturner_cart') || '[]');
    this.selectedCategory = 'all';
    this.selectedBrand = 'all';
    this.searchQuery = '';
    this.sortOption = 'featured';
    
    // Checkout state
    this.selectedAddressId = null;
    this.selectedPaymentMethod = 'Credit / Debit Card';
    this.pointsToRedeem = 0;
    this.activeOrderForCancel = null;
    this.currentView = 'home';
    this.authIsRegister = false;

    this.init();
  }

  async init() {
    // Attempt to load current user from storage or default to demo user 1 (Jane Doe)
    const storedUser = localStorage.getItem('pageturner_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    if (!this.currentUser) {
      // Default to Jane Doe for rich out-of-the-box demo experience
      await this.loginUser('jane@example.com', 'password123');
    }

    await this.fetchMetadata();
    await this.fetchAndRenderBooks();
    this.renderUserHeader();
    this.renderCart();
    this.navigate('home');
    this.refreshIcons();
  }

  refreshIcons() {
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 50);
  }

  // --- Navigation & Views ---
  navigate(viewName, params = {}) {
    this.currentView = viewName;
    document.getElementById('viewHome').classList.add('hidden');
    document.getElementById('viewCatalogue').classList.add('hidden');
    document.getElementById('viewOrders').classList.add('hidden');

    if (viewName === 'home') {
      document.getElementById('viewHome').classList.remove('hidden');
      this.loadHomeSections();
    } else if (viewName === 'catalogue') {
      document.getElementById('viewCatalogue').classList.remove('hidden');
      if (params.category) {
        this.selectCategory(params.category);
      }
      if (params.brand) {
        this.selectBrand(params.brand);
      }
      this.fetchAndRenderBooks();
    } else if (viewName === 'orders') {
      document.getElementById('viewOrders').classList.remove('hidden');
      this.loadOrdersList();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshIcons();
  }

  // --- API Fetching ---
  async fetchMetadata() {
    try {
      const res = await fetch('/api/metadata');
      const data = await res.json();
      this.categories = data.categories || [];
      this.brands = data.brands || [];
      this.renderHomeCategories();
      this.renderHomeBrands();
      this.renderCatalogueFilterPills();
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  }

  async fetchAndRenderBooks() {
    try {
      const sort = document.getElementById('catalogueSort') ? document.getElementById('catalogueSort').value : this.sortOption;
      const url = `/api/books?category=${this.selectedCategory}&brand=${this.selectedBrand}&search=${encodeURIComponent(this.searchQuery)}&sort=${sort}`;
      const res = await fetch(url);
      const data = await res.json();
      this.books = data.books || [];
      this.renderCatalogueBooks();
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  }

  // --- Home View Renderers (Journey 1, 2, 3, 6) ---
  renderHomeCategories() {
    const container = document.getElementById('categoryCardsContainer');
    if (!container) return;

    container.innerHTML = this.categories.map(cat => `
      <div 
        onclick="app.navigate('catalogue', { category: '${cat.id}' })"
        class="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5"
      >
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <i data-lucide="${cat.icon}" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-brand-600 transition">${cat.name}</h3>
          <span class="text-[11px] text-slate-400 font-medium">${cat.count} Titles</span>
        </div>
      </div>
    `).join('');
    this.refreshIcons();
  }

  renderHomeBrands() {
    const container = document.getElementById('brandsContainer');
    if (!container) return;

    container.innerHTML = this.brands.map(brand => `
      <div 
        onclick="app.navigate('catalogue', { brand: '${brand.id}' })"
        class="p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between text-center space-y-2 group"
      >
        <div class="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 font-serif font-bold text-xs flex items-center justify-center mx-auto group-hover:bg-brand-600 group-hover:text-white transition">
          ${brand.logo}
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-800 group-hover:text-brand-600">${brand.name}</h4>
          <p class="text-[10px] text-slate-400 line-clamp-1 mt-0.5">${brand.tagline}</p>
        </div>
      </div>
    `).join('');
    this.refreshIcons();
  }

  async loadHomeSections() {
    if (!this.currentUser) return;

    // Load Buy It Again (Journey 2)
    try {
      const res = await fetch(`/api/users/${this.currentUser.id}/orders`);
      const data = await res.json();
      this.renderBuyItAgain(data.buyItAgain || []);
    } catch (err) {
      console.error('Error loading orders for buy it again:', err);
    }

    // Load Recommendations based on Order History (Journey 2)
    try {
      const res = await fetch(`/api/users/${this.currentUser.id}/recommendations`);
      const data = await res.json();
      this.renderRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  }

  renderBuyItAgain(items) {
    const container = document.getElementById('buyItAgainContainer');
    const section = document.getElementById('buyItAgainSection');
    if (!container || !section) return;

    if (!items || items.length === 0) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');

    container.innerHTML = items.map(item => `
      <div class="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm flex items-center space-x-3.5 hover:shadow-md transition">
        <img src="${item.cover}" alt="${item.title}" class="w-16 h-22 object-cover rounded-lg shadow shrink-0">
        <div class="flex-1 min-w-0 space-y-1">
          <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Ordered Previously</span>
          <h4 class="text-xs font-bold text-slate-900 truncate" title="${item.title}">${item.title}</h4>
          <p class="text-[11px] text-slate-500 truncate">${item.author}</p>
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs font-bold text-brand-600">$${Number(item.price).toFixed(2)}</span>
            <button 
              onclick="app.addToCart('${item.bookId}', 1); event.stopPropagation();"
              class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm transition"
            >
              <i data-lucide="plus" class="w-3 h-3"></i>
              <span>Reorder</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
    this.refreshIcons();
  }

  renderRecommendations(recs) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    if (!recs || recs.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 col-span-full">No recommendations available yet.</p>`;
      return;
    }

    container.innerHTML = recs.map(book => this.generateBookCardHtml(book)).join('');
    this.refreshIcons();
  }

  // --- Catalogue & Product Renderers (Journey 5, 6, 7, 8) ---
  renderCatalogueFilterPills() {
    // Categories (Step 5)
    const catContainer = document.getElementById('categoryFilterPills');
    if (catContainer) {
      catContainer.innerHTML = `
        <button 
          onclick="app.selectCategory('all')" 
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition ${this.selectedCategory === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
        >
          All Categories
        </button>
        ${this.categories.map(c => `
          <button 
            onclick="app.selectCategory('${c.id}')" 
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition ${this.selectedCategory === c.id ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            ${c.name}
          </button>
        `).join('')}
      `;
    }

    // Brands (Step 6)
    const brandContainer = document.getElementById('brandFilterPills');
    if (brandContainer) {
      brandContainer.innerHTML = `
        <button 
          onclick="app.selectBrand('all')" 
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition ${this.selectedBrand === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
        >
          All Publishers
        </button>
        ${this.brands.map(b => `
          <button 
            onclick="app.selectBrand('${b.id}')" 
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition ${this.selectedBrand === b.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            ${b.name}
          </button>
        `).join('')}
      `;
    }
  }

  selectCategory(catId) {
    this.selectedCategory = catId;
    this.renderCatalogueFilterPills();
    this.fetchAndRenderBooks();
  }

  selectBrand(brandId) {
    this.selectedBrand = brandId;
    this.renderCatalogueFilterPills();
    this.fetchAndRenderBooks();
  }

  performSearch(query) {
    this.searchQuery = query;
    this.navigate('catalogue');
    this.fetchAndRenderBooks();
  }

  renderCatalogueBooks() {
    const container = document.getElementById('catalogueBooksGrid');
    if (!container) return;

    if (this.books.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center space-y-3">
          <i data-lucide="book-x" class="w-12 h-12 text-slate-300 mx-auto"></i>
          <h3 class="text-base font-bold text-slate-700">No books found matching your selection</h3>
          <p class="text-xs text-slate-400">Try resetting your filters or search keyword</p>
          <button onclick="app.selectCategory('all'); app.selectBrand('all');" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Reset Filters
          </button>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    container.innerHTML = this.books.map(book => this.generateBookCardHtml(book)).join('');
    this.refreshIcons();
  }

  generateBookCardHtml(book) {
    // Tentative delivery estimation
    const delDate = new Date();
    delDate.setDate(delDate.getDate() + (book.deliveryDays || 2));
    const formattedDate = delDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return `
      <div 
        onclick="app.openProductDetail('${book.id}')"
        class="book-card bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between cursor-pointer group shadow-sm hover:border-brand-500 relative"
      >
        <!-- Discount badge -->
        ${book.discount ? `
          <span class="absolute top-3 left-3 bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10">
            ${book.discount}% OFF
          </span>
        ` : ''}

        <div class="space-y-3">
          <!-- Cover -->
          <div class="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 relative">
            <img src="${book.cover}" alt="${book.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Metadata -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span class="uppercase tracking-wider text-brand-600 font-bold">${book.category}</span>
              <span class="flex items-center text-amber-500 font-bold">
                <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5"></i>
                ${book.rating} (${book.reviews})
              </span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-1" title="${book.title}">${book.title}</h3>
            <p class="text-xs text-slate-500 line-clamp-1">${book.author}</p>
          </div>
        </div>

        <!-- Tentative Delivery Tag & Price / Add to Basket (Step 7 & 8) -->
        <div class="pt-3 border-t border-slate-100 mt-3 space-y-2">
          
          <!-- Step 7: Tentative Delivery Date Tag -->
          <div class="flex items-center space-x-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80 font-medium">
            <i data-lucide="truck" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
            <span class="truncate">Get it by <strong>${formattedDate}</strong></span>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-base font-bold text-slate-900">$${Number(book.price).toFixed(2)}</span>
              ${book.originalPrice ? `<span class="text-xs text-slate-400 line-through ml-1">$${Number(book.originalPrice).toFixed(2)}</span>` : ''}
            </div>

            <!-- Step 8: Add to Basket Button -->
            <button 
              onclick="app.addToCart('${book.id}', 1); event.stopPropagation();"
              class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
            >
              <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Step 7: Product Detail Modal with Tentative Delivery Date & Related Products ---
  async openProductDetail(bookId) {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      const data = await res.json();
      if (!data.book) return;

      this.renderProductDetail(data.book, data.related || []);
      document.getElementById('productDetailModal').classList.remove('hidden');
      this.refreshIcons();
    } catch (err) {
      console.error('Error fetching product detail:', err);
    }
  }

  closeProductDetailModal() {
    document.getElementById('productDetailModal').classList.add('hidden');
  }

  renderProductDetail(book, related) {
    const container = document.getElementById('productDetailContent');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Main Product Info (Step 7) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          
          <!-- Image Column -->
          <div class="md:col-span-5 flex flex-col items-center">
            <div class="w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img src="${book.cover}" alt="${book.title}" class="w-full h-full object-cover">
            </div>
          </div>

          <!-- Info Column -->
          <div class="md:col-span-7 space-y-4">
            <div>
              <div class="flex items-center space-x-2 text-xs font-semibold text-brand-600 mb-1">
                <span class="px-2 py-0.5 rounded bg-brand-50 border border-brand-200 uppercase">${book.category}</span>
                <span>•</span>
                <span class="text-slate-500">${book.format || 'Paperback'} Edition</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-serif font-bold text-slate-900">${book.title}</h2>
              <p class="text-sm font-medium text-slate-600 mt-1">By <span class="text-slate-900 font-bold">${book.author}</span></p>
            </div>

            <!-- Rating & ISBN info -->
            <div class="flex items-center space-x-4 text-xs text-slate-500">
              <div class="flex items-center text-amber-500 font-bold">
                <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400 mr-1"></i>
                <span>${book.rating} / 5.0</span>
                <span class="text-slate-400 font-normal ml-1">(${book.reviews} verified reviews)</span>
              </div>
              <span>•</span>
              <span>ISBN: ${book.isbn}</span>
            </div>

            <!-- Price -->
            <div class="flex items-baseline space-x-3 pt-2">
              <span class="text-3xl font-bold text-slate-900">$${Number(book.price).toFixed(2)}</span>
              ${book.originalPrice ? `<span class="text-base text-slate-400 line-through">$${Number(book.originalPrice).toFixed(2)}</span>` : ''}
              ${book.discount ? `<span class="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Save ${book.discount}%</span>` : ''}
            </div>

            <!-- Description -->
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${book.description}</p>

            <!-- Customer Journey Step 7: Tentative Delivery Date Tag & Pin Checker -->
            <div class="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div class="flex items-center space-x-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <i data-lucide="zap" class="w-4 h-4 text-emerald-600"></i>
                <span>Tentative Estimated Delivery: <span class="text-emerald-700 underline">${book.tentativeDeliveryDate}</span></span>
              </div>
              <div class="text-[11px] text-emerald-700 flex items-center justify-between">
                <span>Fast Dispatch • 48-Hour Free Cancellation Guaranteed</span>
                <span class="font-bold">In Stock (${book.stock} copies left)</span>
              </div>
            </div>

            <!-- Step 8: Quantity Selector & Add to Basket -->
            <div class="flex items-center space-x-3 pt-2">
              <div class="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button onclick="app.adjustDetailQty(-1)" class="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition">-</button>
                <input type="number" id="detailQtyInput" value="1" min="1" max="10" class="w-10 text-center font-bold text-xs bg-transparent outline-none">
                <button onclick="app.adjustDetailQty(1)" class="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition">+</button>
              </div>

              <button 
                onclick="app.addFromDetail('${book.id}')"
                class="flex-1 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition flex items-center justify-center space-x-2"
              >
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                <span>Add to Basket</span>
              </button>
            </div>

          </div>
        </div>

        <!-- Customer Journey Step 7: Related Products appear for selection -->
        <div class="pt-6 border-t border-slate-200 space-y-4">
          <div>
            <div class="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>Customer Journey Step 7</span>
            </div>
            <h3 class="text-lg font-serif font-bold text-slate-900">Customers who bought this also bought</h3>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            ${related.map(rel => `
              <div 
                onclick="app.openProductDetail('${rel.id}')"
                class="bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-brand-500 transition cursor-pointer flex flex-col justify-between space-y-2"
              >
                <img src="${rel.cover}" alt="${rel.title}" class="aspect-[3/4] w-full object-cover rounded-lg shadow-xs">
                <div>
                  <h4 class="text-xs font-bold text-slate-900 truncate" title="${rel.title}">${rel.title}</h4>
                  <p class="text-[10px] text-slate-500 truncate">${rel.author}</p>
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-xs font-bold text-brand-600">$${Number(rel.price).toFixed(2)}</span>
                    <button 
                      onclick="app.addToCart('${rel.id}', 1); event.stopPropagation();"
                      class="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-brand-600 transition"
                      title="Add to basket"
                    >
                      <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
    this.refreshIcons();
  }

  adjustDetailQty(delta) {
    const input = document.getElementById('detailQtyInput');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(10, val + delta));
    input.value = val;
  }

  addFromDetail(bookId) {
    const input = document.getElementById('detailQtyInput');
    const qty = input ? (parseInt(input.value) || 1) : 1;
    this.addToCart(bookId, qty);
    this.closeProductDetailModal();
  }

  // --- Step 8: Basket / Cart Management ---
  addToCart(bookId, quantity = 1) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;

    const existing = this.cart.find(item => item.id === bookId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover: book.cover,
        category: book.category,
        quantity: quantity
      });
    }

    this.saveCart();
    this.renderCart();
    this.showToast(`Added "${book.title}" to your basket!`, 'success');
  }

  updateCartQty(bookId, delta) {
    const item = this.cart.find(i => i.id === bookId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.id !== bookId);
    }

    this.saveCart();
    this.renderCart();
  }

  removeFromCart(bookId) {
    this.cart = this.cart.filter(i => i.id !== bookId);
    this.saveCart();
    this.renderCart();
  }

  saveCart() {
    localStorage.setItem('pageturner_cart', JSON.stringify(this.cart));
  }

  toggleCartDrawer(show) {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      if (show) drawer.classList.remove('hidden');
      else drawer.classList.add('hidden');
    }
  }

  renderCart() {
    const totalItems = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Update badges
    const badge = document.getElementById('cartBadgeCount');
    if (badge) badge.textContent = totalItems;
    const drawerCount = document.getElementById('cartDrawerCount');
    if (drawerCount) drawerCount.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;

    // Subtotal
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Free shipping bar ($35 threshold)
    const freeBar = document.getElementById('freeShippingBar');
    const freeRemain = document.getElementById('freeShippingRemain');
    if (freeBar && freeRemain) {
      const pct = Math.min(100, (subtotal / 35) * 100);
      freeBar.style.width = `${pct}%`;
      if (subtotal >= 35) {
        freeRemain.textContent = '🎉 You unlocked Free Delivery!';
      } else {
        freeRemain.textContent = `$${(35 - subtotal).toFixed(2)} away from Free Delivery`;
      }
    }

    // Render items list
    const container = document.getElementById('cartItemsList');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center space-y-3">
          <i data-lucide="shopping-bag" class="w-12 h-12 text-slate-300 mx-auto"></i>
          <h4 class="text-sm font-bold text-slate-700">Your basket is currently empty</h4>
          <p class="text-xs text-slate-400">Browse our catalogue and find your next favorite read.</p>
          <button onclick="app.toggleCartDrawer(false); app.navigate('catalogue');" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Explore Books
          </button>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
        <img src="${item.cover}" alt="${item.title}" class="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0">
        <div class="flex-1 min-w-0 space-y-0.5">
          <h4 class="text-xs font-bold text-slate-900 truncate">${item.title}</h4>
          <p class="text-[11px] text-slate-500 truncate">${item.author}</p>
          <div class="text-xs font-bold text-brand-600">$${Number(item.price).toFixed(2)}</div>
        </div>
        <div class="flex items-center space-x-1 border border-slate-200 rounded-lg bg-white p-0.5">
          <button onclick="app.updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded text-xs">-</button>
          <span class="w-6 text-center font-bold text-xs">${item.quantity}</span>
          <button onclick="app.updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded text-xs">+</button>
        </div>
        <button onclick="app.removeFromCart('${item.id}')" class="p-1.5 text-slate-400 hover:text-red-500 transition">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
    this.refreshIcons();
  }

  // --- Step 9, 10, 11, 12: Checkout & Payment & Gift Points & 48h Cancel ---
  openCheckoutModal() {
    if (this.cart.length === 0) {
      this.showToast('Your basket is empty. Please add books before checkout.', 'info');
      return;
    }

    this.toggleCartDrawer(false);
    this.pointsToRedeem = 0;
    this.selectedPaymentMethod = 'Credit / Debit Card';

    // Show step 1 (Address)
    document.getElementById('checkoutStepAddress').classList.remove('hidden');
    document.getElementById('checkoutStepPayment').classList.add('hidden');
    document.getElementById('checkoutStepProcessing').classList.add('hidden');
    document.getElementById('checkoutStepSuccess').classList.add('hidden');

    this.updateCheckoutStepper(1);
    this.renderSavedAddresses();
    document.getElementById('checkoutModal').classList.remove('hidden');
    this.refreshIcons();
  }

  closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.add('hidden');
  }

  updateCheckoutStepper(step) {
    const s1 = document.getElementById('stepIndicator1');
    const s2 = document.getElementById('stepIndicator2');
    const s3 = document.getElementById('stepIndicator3');

    if (s1 && s2 && s3) {
      s1.className = step >= 1 ? 'flex items-center space-x-1.5 text-brand-600 font-bold' : 'flex items-center space-x-1.5 text-slate-400';
      s2.className = step >= 2 ? 'flex items-center space-x-1.5 text-brand-600 font-bold' : 'flex items-center space-x-1.5 text-slate-400';
      s3.className = step >= 3 ? 'flex items-center space-x-1.5 text-brand-600 font-bold' : 'flex items-center space-x-1.5 text-slate-400';
    }
  }

  // Step 9: Delivery Address Selection
  renderSavedAddresses() {
    const container = document.getElementById('savedAddressesContainer');
    if (!container || !this.currentUser) return;

    const addresses = this.currentUser.addresses || [];
    if (!this.selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      this.selectedAddressId = defaultAddr.id;
    }

    container.innerHTML = addresses.map(addr => `
      <label class="p-4 rounded-2xl border-2 transition cursor-pointer relative ${this.selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}">
        <input 
          type="radio" 
          name="selectedAddress" 
          value="${addr.id}" 
          ${this.selectedAddressId === addr.id ? 'checked' : ''} 
          onchange="app.selectedAddressId = '${addr.id}'; app.renderSavedAddresses();"
          class="absolute top-4 right-4 accent-brand-600"
        >
        <div class="space-y-1 text-xs pr-6">
          <div class="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
            <span>${addr.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">${addr.type}</span>
            ${addr.isDefault ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 font-bold">Default</span>' : ''}
          </div>
          <p class="text-slate-600">${addr.street}</p>
          <p class="text-slate-600">${addr.city}, ${addr.state} ${addr.zip}</p>
          <p class="text-slate-400 font-medium pt-1">Phone: ${addr.phone}</p>
        </div>
      </label>
    `).join('');
    this.refreshIcons();
  }

  toggleNewAddressForm(show) {
    const form = document.getElementById('newAddressForm');
    if (form) {
      if (show) form.classList.remove('hidden');
      else form.classList.add('hidden');
    }
  }

  async saveNewAddress() {
    const name = document.getElementById('newAddrName').value.trim();
    const phone = document.getElementById('newAddrPhone').value.trim();
    const street = document.getElementById('newAddrStreet').value.trim();
    const city = document.getElementById('newAddrCity').value.trim();
    const state = document.getElementById('newAddrState').value.trim();
    const zip = document.getElementById('newAddrZip').value.trim();
    const type = document.getElementById('newAddrType').value;

    if (!name || !phone || !street || !city || !state || !zip) {
      this.showToast('Please fill all address fields', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/users/${this.currentUser.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, street, city, state, zip, type, isDefault: true })
      });
      const data = await res.json();
      if (data.addresses) {
        this.currentUser.addresses = data.addresses;
        this.selectedAddressId = data.newAddress.id;
        this.toggleNewAddressForm(false);
        this.renderSavedAddresses();
        this.showToast('New delivery address saved!', 'success');
      }
    } catch (err) {
      console.error('Error saving address:', err);
    }
  }

  proceedToPaymentStep() {
    if (!this.selectedAddressId) {
      this.showToast('Please select or add a delivery address', 'info');
      return;
    }

    document.getElementById('checkoutStepAddress').classList.add('hidden');
    document.getElementById('checkoutStepPayment').classList.remove('hidden');
    this.updateCheckoutStepper(2);

    this.setupPointsSlider();
    this.recalculateCheckoutTotals();
    this.refreshIcons();
  }

  backToAddressStep() {
    document.getElementById('checkoutStepPayment').classList.add('hidden');
    document.getElementById('checkoutStepAddress').classList.remove('hidden');
    this.updateCheckoutStepper(1);
    this.refreshIcons();
  }

  // Step 10: Redeem Gift Points & Calculations
  setupPointsSlider() {
    const points = this.currentUser ? this.currentUser.giftPoints : 0;
    const dollarVal = (points * 0.05).toFixed(2);

    const balEl = document.getElementById('userPointsBalance');
    if (balEl) balEl.textContent = `${points} Points`;
    const valEl = document.getElementById('userPointsDollarValue');
    if (valEl) valEl.textContent = dollarVal;

    const slider = document.getElementById('pointsRedeemSlider');
    if (slider) {
      slider.max = points;
      slider.value = this.pointsToRedeem;
    }
  }

  onPointsSliderChange(val) {
    this.pointsToRedeem = Number(val) || 0;
    this.recalculateCheckoutTotals();
  }

  redeemMaxPoints() {
    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const maxRedeemableDollars = subtotal * 0.5;
    const maxRedeemablePoints = Math.floor(maxRedeemableDollars * 20);
    const userPoints = this.currentUser ? this.currentUser.giftPoints : 0;
    this.pointsToRedeem = Math.min(userPoints, maxRedeemablePoints);

    const slider = document.getElementById('pointsRedeemSlider');
    if (slider) slider.value = this.pointsToRedeem;

    this.recalculateCheckoutTotals();
  }

  recalculateCheckoutTotals() {
    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discount = Math.round((this.pointsToRedeem * 0.05) * 100) / 100;
    const shipping = subtotal >= 35 ? 0.00 : 4.99;
    const total = Math.max(0, subtotal - discount + shipping);
    const pointsToEarn = Math.floor(total);

    // Update labels
    const label = document.getElementById('pointsSliderLabel');
    if (label) label.textContent = `${this.pointsToRedeem} pts ($${discount.toFixed(2)})`;

    const savingsBadge = document.getElementById('redeemedPointsSavings');
    if (savingsBadge) savingsBadge.textContent = `-$${discount.toFixed(2)} Saved`;

    const subEl = document.getElementById('checkoutSubtotal');
    if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;

    const discEl = document.getElementById('checkoutDiscount');
    if (discEl) discEl.textContent = `-$${discount.toFixed(2)}`;

    const shipEl = document.getElementById('checkoutShipping');
    if (shipEl) shipEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;

    const totEl = document.getElementById('checkoutFinalTotal');
    if (totEl) totEl.textContent = `$${total.toFixed(2)}`;

    const earnEl = document.getElementById('checkoutPointsToEarn');
    if (earnEl) earnEl.textContent = `${pointsToEarn} points`;
  }

  // Step 11: Submit Payment & Process Order
  async submitPayment() {
    const selectedAddress = this.currentUser.addresses.find(a => a.id === this.selectedAddressId) || this.currentUser.addresses[0];
    const selectedPayRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = selectedPayRadio ? selectedPayRadio.value : 'Credit / Debit Card';

    // Show processing animation (Step 11)
    document.getElementById('checkoutStepPayment').classList.add('hidden');
    document.getElementById('checkoutStepProcessing').classList.remove('hidden');

    try {
      // Simulate secure gateway delay
      await new Promise(r => setTimeout(r, 1200));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUser.id,
          items: this.cart,
          address: selectedAddress,
          paymentMethod,
          pointsToRedeem: this.pointsToRedeem
        })
      });

      const data = await res.json();
      if (data.order) {
        // Update user state
        this.currentUser.giftPoints = data.updatedUser.giftPoints;
        localStorage.setItem('pageturner_user', JSON.stringify(this.currentUser));
        this.renderUserHeader();

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.renderCart();

        // Show Order Success with 48h Cancel guarantee (Step 11 & 12)
        document.getElementById('checkoutStepProcessing').classList.add('hidden');
        document.getElementById('checkoutStepSuccess').classList.remove('hidden');
        this.updateCheckoutStepper(3);
        this.renderOrderSuccess(data.order);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      this.showToast('Payment failed. Please try again.', 'error');
      document.getElementById('checkoutStepProcessing').classList.add('hidden');
      document.getElementById('checkoutStepPayment').classList.remove('hidden');
    }
  }

  // Step 12: Purchase Confirmation & 48-Hour Cancellation Window
  renderOrderSuccess(order) {
    const container = document.getElementById('checkoutStepSuccess');
    if (!container) return;

    const deliveryFormatted = new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    container.innerHTML = `
      <div class="text-center space-y-3 pb-4 border-b border-slate-100">
        <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <i data-lucide="check-circle" class="w-8 h-8"></i>
        </div>
        <h3 class="text-2xl font-serif font-bold text-slate-900">Purchase Confirmed!</h3>
        <p class="text-xs text-slate-500">Thank you for your order, <strong>${this.currentUser.name}</strong>. Confirmation email and invoice have been dispatched.</p>
        <div class="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
          Order ID: #${order.id}
        </div>
      </div>

      <!-- Customer Journey Step 12: 48-Hour Free Cancellation Banner & Live Countdown -->
      <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center space-x-3 text-left">
          <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <i data-lucide="clock" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
              <span>Cancel Order Guarantee (Step 12)</span>
              <span class="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">48 Hrs</span>
            </h4>
            <p class="text-[11px] text-amber-700">You can cancel this order with 100% full refund and points reversal within <strong>${order.cancellationHoursLeft} hours</strong>.</p>
          </div>
        </div>

        <button 
          onclick="app.openCancelModal('${order.id}')"
          class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
        >
          Cancel Order Within 48 hrs
        </button>
      </div>

      <!-- Estimated Delivery Timeline Tracker -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-700">Estimated Delivery Date:</span>
          <span class="font-bold text-emerald-700">${deliveryFormatted}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500 relative">
          <div class="flex flex-col items-center">
            <span class="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
            <span class="font-bold text-slate-800 mt-1">Confirmed</span>
          </div>
          <div class="flex-1 h-0.5 bg-slate-200 mx-2"></div>
          <div class="flex flex-col items-center">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span class="mt-1">Dispatched</span>
          </div>
          <div class="flex-1 h-0.5 bg-slate-200 mx-2"></div>
          <div class="flex flex-col items-center">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span class="mt-1">Delivered</span>
          </div>
        </div>
      </div>

      <!-- Items Summary & Points Earned -->
      <div class="space-y-2 text-xs">
        <div class="font-bold text-slate-700">Ordered Items (${order.items.length})</div>
        <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
          ${order.items.map(i => `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-800 font-medium">${i.quantity}x ${i.title}</span>
              <span class="font-bold text-slate-900">$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="pt-2 flex justify-between font-bold text-slate-900 text-sm">
          <span>Total Paid:</span>
          <span class="text-brand-600">$${Number(order.total).toFixed(2)}</span>
        </div>
        <div class="text-[11px] text-emerald-700 flex items-center space-x-1">
          <i data-lucide="gift" class="w-3.5 h-3.5"></i>
          <span>You earned <strong>+${order.pointsEarned} Gift Points</strong> on this order!</span>
        </div>
      </div>

      <div class="flex justify-center pt-2">
        <button onclick="app.closeCheckoutModal(); app.navigate('orders');" class="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md">
          View in Order History
        </button>
      </div>
    `;
    this.refreshIcons();
  }

  // Step 12: 48-Hour Order Cancellation Flow
  openCancelModal(orderId) {
    this.activeOrderForCancel = orderId;
    const modalId = document.getElementById('cancelModalOrderId');
    if (modalId) modalId.textContent = `#${orderId}`;
    document.getElementById('cancelOrderModal').classList.remove('hidden');
    this.refreshIcons();
  }

  closeCancelModal() {
    document.getElementById('cancelOrderModal').classList.add('hidden');
    this.activeOrderForCancel = null;
  }

  async confirmCancellation() {
    if (!this.activeOrderForCancel) return;

    const reason = document.getElementById('cancelReasonSelect').value;
    try {
      const res = await fetch(`/api/orders/${this.activeOrderForCancel}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const data = await res.json();
      if (res.ok) {
        this.showToast(`Order #${this.activeOrderForCancel} cancelled! Full refund of $${data.refundAmount} and points restored.`, 'success');
        if (this.currentUser) {
          this.currentUser.giftPoints = data.userGiftPoints;
          localStorage.setItem('pageturner_user', JSON.stringify(this.currentUser));
          this.renderUserHeader();
        }
        this.closeCancelModal();
        this.closeCheckoutModal();
        this.navigate('orders');
      } else {
        this.showToast(data.error || 'Cancellation failed', 'error');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  }

  // --- Orders View (Journey 2 & 12) ---
  async loadOrdersList() {
    if (!this.currentUser) return;

    try {
      const res = await fetch(`/api/users/${this.currentUser.id}/orders`);
      const data = await res.json();
      this.renderOrdersList(data.orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }

  renderOrdersList(orders) {
    const container = document.getElementById('ordersListContainer');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <i data-lucide="package" class="w-12 h-12 text-slate-300 mx-auto"></i>
          <h3 class="text-base font-bold text-slate-700">No Orders Placed Yet</h3>
          <p class="text-xs text-slate-400">Your order history and active shipments will appear here.</p>
          <button onclick="app.navigate('catalogue')" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Start Shopping
          </button>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    container.innerHTML = orders.map(order => {
      const placedDate = new Date(order.placedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const statusColor = order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : (order.status === 'Delivered' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800');

      return `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-mono font-bold text-slate-900 text-sm">Order #${order.id}</span>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColor}">${order.status}</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Placed on ${placedDate} • Paid via ${order.paymentMethod}</p>
            </div>

            <!-- 48-Hour Cancellation Button or Status Badge (Step 12) -->
            <div>
              ${order.canCancel ? `
                <div class="flex items-center space-x-2">
                  <span class="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    ⏱️ ${order.cancellationHoursLeft}h left to cancel
                  </span>
                  <button 
                    onclick="app.openCancelModal('${order.id}')"
                    class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                  >
                    Cancel Order
                  </button>
                </div>
              ` : (order.status === 'Cancelled' ? `
                <span class="text-xs text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-lg">
                  Refund of $${order.total} Processed
                </span>
              ` : `
                <span class="text-xs text-slate-400 font-medium">Past 48h Window</span>
              `)}
            </div>
          </div>

          <!-- Items list with Buy It Again option -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${order.items.map(item => `
              <div class="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <img src="${item.cover}" alt="${item.title}" class="w-12 h-16 object-cover rounded shadow-xs shrink-0">
                <div class="flex-1 min-w-0 space-y-0.5">
                  <h4 class="text-xs font-bold text-slate-900 truncate">${item.title}</h4>
                  <p class="text-[11px] text-slate-500 truncate">${item.author}</p>
                  <p class="text-xs font-bold text-brand-600">$${Number(item.price).toFixed(2)} (Qty: ${item.quantity})</p>
                </div>
                <!-- Journey 2: Buy It Again Button -->
                <button 
                  onclick="app.addToCart('${item.bookId}', 1); event.stopPropagation();"
                  class="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm shrink-0"
                  title="Buy it again"
                >
                  <i data-lucide="rotate-cw" class="w-3 h-3"></i>
                  <span>Buy Again</span>
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Order Summary footer -->
          <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div>
              <span>Delivery to: <strong>${order.address.name}, ${order.address.city} (${order.address.zip})</strong></span>
            </div>
            <div class="flex items-center space-x-4">
              ${order.pointsRedeemed ? `<span>Points Used: <strong class="text-amber-700">${order.pointsRedeemed} pts</strong></span>` : ''}
              <span class="text-sm font-bold text-slate-900">Total: <span class="text-brand-600">$${Number(order.total).toFixed(2)}</span></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    this.refreshIcons();
  }

  // --- Step 1: User Authentication & Demo Account Switching ---
  renderUserHeader() {
    const container = document.getElementById('userHeaderSection');
    if (!container) return;

    if (!this.currentUser) {
      container.innerHTML = `
        <button onclick="app.openLoginModal()" class="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition flex items-center space-x-1.5">
          <i data-lucide="user" class="w-4 h-4"></i>
          <span>Sign In</span>
        </button>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center space-x-2">
          <!-- Gift Points Pill -->
          <button onclick="app.navigate('orders')" class="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 transition">
            <i data-lucide="gift" class="w-3.5 h-3.5 text-amber-600"></i>
            <span>${this.currentUser.giftPoints} Pts</span>
          </button>

          <!-- User Avatar & Dropdown Trigger -->
          <div class="flex items-center space-x-2 pl-1 cursor-pointer" onclick="app.openLoginModal()">
            <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500">
            <span class="hidden md:inline text-xs font-bold text-slate-800">${this.currentUser.name}</span>
          </div>
        </div>
      `;
    }
    this.refreshIcons();
  }

  openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
  }

  closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
  }

  toggleAuthMode() {
    this.authIsRegister = !this.authIsRegister;
    const nameField = document.getElementById('authNameField');
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');
    const toggleBtn = document.getElementById('authToggleBtn');

    if (this.authIsRegister) {
      nameField.classList.remove('hidden');
      title.textContent = 'Create an Account';
      submitBtn.textContent = 'Register & Claim 100 Pts';
      toggleText.textContent = 'Already have an account?';
      toggleBtn.textContent = 'Sign in';
    } else {
      nameField.classList.add('hidden');
      title.textContent = 'Welcome to PageTurner';
      submitBtn.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = 'Create one';
    }
  }

  async quickSwitchUser(userId) {
    if (userId === 'user-1') {
      await this.loginUser('jane@example.com', 'password123');
    } else if (userId === 'user-2') {
      await this.loginUser('alex@example.com', 'password123');
    }
    this.showToast(`Switched account to ${this.currentUser.name}!`, 'info');
  }

  async quickLoginDemo(email, password) {
    await this.loginUser(email, password);
    this.closeLoginModal();
    this.showToast(`Signed in as ${this.currentUser.name}`, 'success');
  }

  async handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmailInput').value.trim();
    const password = document.getElementById('authPasswordInput').value.trim();

    if (this.authIsRegister) {
      const name = document.getElementById('authNameInput').value.trim();
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.user) {
          this.currentUser = data.user;
          localStorage.setItem('pageturner_user', JSON.stringify(this.currentUser));
          this.renderUserHeader();
          this.closeLoginModal();
          this.showToast('Account created! +100 Gift Points awarded.', 'success');
          this.navigate('home');
        } else {
          this.showToast(data.error || 'Registration failed', 'error');
        }
      } catch (err) {
        console.error('Registration error:', err);
      }
    } else {
      await this.loginUser(email, password);
      this.closeLoginModal();
    }
  }

  async loginUser(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.user) {
        this.currentUser = data.user;
        localStorage.setItem('pageturner_user', JSON.stringify(this.currentUser));
        this.renderUserHeader();
        this.loadHomeSections();
      } else {
        this.showToast(data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  // --- Toast Notifications ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const colorClasses = type === 'success' 
      ? 'bg-emerald-900/90 text-white border-emerald-700' 
      : (type === 'error' ? 'bg-red-900/90 text-white border-red-700' : 'bg-slate-900/90 text-white border-slate-700');

    toast.className = `toast-item pointer-events-auto px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md flex items-center space-x-2.5 max-w-sm ${colorClasses}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info')}" class="w-4 h-4 shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global App Instance Initialization
window.app = new BookstoreApp();
