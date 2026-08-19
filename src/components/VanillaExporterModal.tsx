import React, { useState } from 'react';
import { X, Download, FileCode, Check, Copy, Layers, ExternalLink, Globe } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const VanillaExporterModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen } = useShop();
  const [selectedFile, setSelectedFile] = useState<'index.html' | 'style.css' | 'app.js' | 'config.js' | 'README.md'>('index.html');
  const [copied, setCopied] = useState(false);

  if (!isExportModalOpen) return null;

  const fileContents = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TODAY'S TREND - Local Mall Online Store</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="top-banner">
      <span>⚡ Fast Local Mall Delivery within 2-3 Hours • Pay on Delivery</span>
    </div>
    <div class="header-main">
      <div class="logo">
        <span class="logo-badge">TT</span>
        <div>
          <h2>TODAY'S <span>TREND</span></h2>
          <p>Local Mall Online Store</p>
        </div>
      </div>
      <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Search sarees, kurtis, electronics, kitchen items...">
        <button id="searchBtn"><i class="fa fa-search"></i></button>
      </div>
      <div class="header-actions">
        <button id="likedBtn" class="icon-btn"><i class="fa-solid fa-heart"></i> <span id="likedCount">0</span></button>
        <button id="cartBtn" class="primary-btn"><i class="fa-solid fa-bag-shopping"></i> Cart (<span id="cartCount">0</span>)</button>
      </div>
    </div>
    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button class="nav-tab active" data-tab="home"><i class="fa-solid fa-house"></i> Home</button>
      <button class="nav-tab" data-tab="categories"><i class="fa-solid fa-table-cells-large"></i> Categories</button>
      <button class="nav-tab" data-tab="orders"><i class="fa-solid fa-box-archive"></i> My Orders</button>
    </nav>
  </header>

  <!-- Main Container -->
  <main class="container" id="mainApp">
    <!-- Views rendered dynamically by app.js -->
  </main>

  <!-- Checkout Modal (No Login Required) -->
  <div id="checkoutModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Direct Mall Checkout</h3>
        <button class="close-btn" onclick="closeCheckout()">&times;</button>
      </div>
      <form id="checkoutForm">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="custName" required placeholder="Enter full name">
        </div>
        <div class="form-group">
          <label>Phone Number *</label>
          <input type="tel" id="custPhone" required maxlength="10" placeholder="10-digit mobile number">
        </div>
        <div class="form-group">
          <label>Home / Flat Number *</label>
          <input type="text" id="custHome" required placeholder="Flat / House / Door number">
        </div>
        <div class="form-group">
          <label>Address / Street *</label>
          <textarea id="custAddress" required placeholder="Street address & area"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>City *</label>
            <input type="text" id="custCity" required value="Local City">
          </div>
          <div class="form-group">
            <label>State *</label>
            <input type="text" id="custState" required value="State">
          </div>
          <div class="form-group">
            <label>Pin Code *</label>
            <input type="text" id="custPincode" required maxlength="6" placeholder="Pincode">
          </div>
        </div>
        <button type="submit" class="submit-order-btn">Confirm Order • Cash on Delivery</button>
      </form>
    </div>
  </div>

  <script src="config.js"></script>
  <script src="app.js"></script>
</body>
</html>`,

    'config.js': `// TODAY'S TREND - Configuration
const CONFIG = {
  STORE_NAME: "TODAY'S TREND",
  MALL_NAME: "Local City Mall",
  CONTACT_PHONE: "+91 9811223344",
  // Google Apps Script Web App URL for Google Sheets database sync:
  GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  ESTIMATED_DELIVERY: "Today within 2-3 Hours",
};`,

    'style.css': `/* TODAY'S TREND Meesho Style CSS */
:root {
  --primary: #9f2089;
  --primary-hover: #bf26a7;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --emerald: #059669;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
body { background: var(--bg); color: var(--text); padding-bottom: 60px; }

.header { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
.top-banner { background: var(--primary); color: #fff; text-align: center; font-size: 12px; font-weight: bold; padding: 6px 12px; }
.header-main { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; gap: 16px; }

.logo { display: flex; align-items: center; gap: 10px; }
.logo-badge { background: var(--primary); color: #fff; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 900; }
.logo h2 { font-size: 18px; font-weight: 900; }
.logo h2 span { color: var(--primary); }
.logo p { font-size: 11px; color: var(--muted); }

.search-bar { flex: 1; max-width: 500px; position: relative; }
.search-bar input { width: 100%; padding: 10px 40px 10px 14px; border: 1px solid var(--border); border-radius: 8px; outline: none; font-size: 13px; }
.search-bar button { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; }

.header-actions { display: flex; gap: 12px; }
.primary-btn { background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.icon-btn { background: #fff; border: 1px solid var(--border); padding: 8px 12px; border-radius: 8px; cursor: pointer; }

.nav-tabs { display: flex; gap: 24px; max-width: 1200px; margin: 0 auto; padding: 0 16px; border-top: 1px solid var(--border); }
.nav-tab { background: none; border: none; padding: 12px 4px; font-size: 14px; font-weight: 600; color: var(--muted); border-bottom: 3px solid transparent; cursor: pointer; }
.nav-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.container { max-width: 1200px; margin: 20px auto; padding: 0 16px; }

/* Product Grid */
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.product-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-col; transition: 0.2s; }
.product-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.product-card img { width: 100%; aspect-ratio: 1; object-fit: cover; }
.product-card-body { padding: 12px; }
.product-title { font-size: 13px; font-weight: bold; margin: 6px 0; }
.price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.price { font-size: 16px; font-weight: 900; }
.original-price { font-size: 12px; text-decoration: line-through; color: var(--muted); }
.discount { font-size: 12px; font-weight: bold; color: var(--emerald); }
.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
.btn-cart { background: #fdf2f8; color: var(--primary); border: 1px solid #fbcfe8; padding: 8px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; }
.btn-order { background: var(--primary); color: #fff; border: none; padding: 8px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; }

/* Modal */
.modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 16px; padding: 20px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; }
.form-group input, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.submit-order-btn { width: 100%; background: var(--primary); color: #fff; padding: 12px; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; }`,

    'app.js': `// TODAY'S TREND - Vanilla JS Application Logic
const PRODUCTS = [
  // 5 Mains Categories Data initialized here
  {
    id: "prod-1",
    name: "Embroidered Rayon Anarkali Kurti Set",
    category: "Men & woman Fashion",
    price: 699,
    originalPrice: 1899,
    discountPercent: 63,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", "...", "...", "..."],
    mallShop: "Roopkala Fashion (Shop 104)"
  },
  {
    id: "prod-2",
    name: "Kanjivaram Soft Silk Festive Saree",
    category: "Saree & jewelry",
    price: 999,
    originalPrice: 3499,
    discountPercent: 71,
    images: ["https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=800&q=80", "...", "...", "..."],
    mallShop: "Mahalaxmi Silks (Shop 201)"
  },
  {
    id: "prod-3",
    name: "Wireless ANC Bluetooth Earbuds 40H",
    category: "Electronics & sports",
    price: 799,
    originalPrice: 2999,
    discountPercent: 73,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "...", "...", "..."],
    mallShop: "TechWorld (Shop 108)"
  },
  {
    id: "prod-4",
    name: "Non-Stick Granite 3-Piece Cookware Set",
    category: "Kitchen items",
    price: 1299,
    originalPrice: 3499,
    discountPercent: 63,
    images: ["https://images.unsplash.com/photo-1584990347449-35c91be83533?auto=format&fit=crop&w=800&q=80", "...", "...", "..."],
    mallShop: "Home & Hearth (Shop 122)"
  },
  {
    id: "prod-5",
    name: "Custom Engraved Name & LED Keychain",
    category: "Custom products",
    price: 199,
    originalPrice: 599,
    discountPercent: 67,
    images: ["https://images.unsplash.com/photo-1614036417651-efe5912149d8?auto=format&fit=crop&w=800&q=80", "...", "...", "..."],
    mallShop: "Artisans Craft (Kiosk K-02)"
  }
];

let cart = JSON.parse(localStorage.getItem('tt_cart') || '[]');
let liked = JSON.parse(localStorage.getItem('tt_liked') || '[]');
let orders = JSON.parse(localStorage.getItem('tt_orders') || '[]');

function init() {
  renderHome();
  setupEventListeners();
}

function renderHome() {
  const main = document.getElementById('mainApp');
  main.innerHTML = \`
    <div class="product-grid">
      \${PRODUCTS.map(p => \`
        <div class="product-card">
          <img src="\${p.images[0]}" alt="\${p.name}">
          <div class="product-card-body">
            <h4 class="product-title">\${p.name}</h4>
            <div class="price-row">
              <span class="price">₹\${p.price}</span>
              <span class="original-price">₹\${p.originalPrice}</span>
              <span class="discount">\${p.discountPercent}% OFF</span>
            </div>
            <p style="font-size:11px;color:#64748b;">📍 \${p.mallShop}</p>
            <div class="card-actions">
              <button class="btn-cart" onclick="addToCart('\${p.id}')">Add to Cart</button>
              <button class="btn-order" onclick="openCheckout('\${p.id}')">Order Now</button>
            </div>
          </div>
        </div>
      \`).join('')}
    </div>
  \`;
}

// Submits order to Google Sheets
async function submitOrderToSheets(order) {
  if (!CONFIG.GOOGLE_APPS_SCRIPT_URL) return;
  try {
    await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
  } catch(e) {
    console.error("Synced locally:", e);
  }
}

window.onload = init;`,

    'README.md': `# TODAY'S TREND - Local Mall E-Commerce Website

A Meesho-style online shopping website for **TODAY'S TREND** local mall, featuring instant doorstep delivery, cash on delivery, and a Google Sheets backend with no user login required.

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend / Database:** Google Sheets via Google Apps Script Web App
- **Hosting:** Static GitHub Pages

## Deployment on GitHub Pages:
1. Create a repository on GitHub named \`today-trends\`.
2. Upload \`index.html\`, \`style.css\`, \`app.js\`, and \`config.js\`.
3. Go to **Settings → Pages** and select **Branch: main / root**.
4. Your site will be live instantly!

## Google Sheets Backend Setup:
1. Open [sheets.new](https://sheets.new)
2. Go to **Extensions → Apps Script** and paste the \`Code.gs\` script.
3. Deploy as **Web App** (Who has access: **Anyone**).
4. Put the Web App URL in \`config.js\`.`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadZip = () => {
    const blob = new Blob([fileContents[selectedFile]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-pink-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#9f2089] to-[#bf26a7] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                Standalone Vanilla Files for GitHub Pages
              </h2>
              <p className="text-xs text-pink-100">
                Pure HTML5 / CSS3 / Vanilla JS + Google Sheets backend
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation / Tab selectors */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['index.html', 'style.css', 'app.js', 'config.js', 'README.md'] as const).map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedFile === file
                    ? 'bg-[#9f2089] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {file}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadZip}
              className="bg-[#9f2089] hover:bg-[#bf26a7] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {selectedFile}</span>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
          <pre className="text-pink-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {fileContents[selectedFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};
