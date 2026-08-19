import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Code,
  Sparkles,
  Send,
  Loader2,
  RefreshCw,
  Package,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { STANDALONE_PRODUCTS_APPS_SCRIPT_CODE } from '../utils/googleSheetsSync';

export const GoogleSheetsSetupModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    appsScriptUrl,
    updateAppsScriptUrl,
    productsScriptUrl,
    updateProductsScriptUrl,
    refreshProductsFromSheet,
    products,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [ordersUrl, setOrdersUrl] = useState(appsScriptUrl);
  const [prodUrl, setProdUrl] = useState(productsScriptUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);

  if (!isSettingsOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(STANDALONE_PRODUCTS_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveProductsUrl = () => {
    updateProductsScriptUrl(prodUrl);
    setTestStatus('✅ Saved Products Sheet Web App URL successfully!');
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleSaveOrdersUrl = () => {
    updateAppsScriptUrl(ordersUrl);
    setTestStatus('✅ Saved Orders Sheet Web App URL successfully!');
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleSyncProducts = async () => {
    setSyncingProducts(true);
    setTestStatus('Fetching live products from your Google Sheet...');
    try {
      await refreshProductsFromSheet(prodUrl || undefined);
      setTestStatus('✅ Products synced successfully from Google Sheet!');
    } catch (e) {
      setTestStatus('❌ Could not sync products: ' + String(e));
    } finally {
      setSyncingProducts(false);
    }
  };

  const handleTestOrder = async () => {
    if (!ordersUrl.trim()) {
      setTestStatus('Please enter a valid Orders Web App URL first.');
      return;
    }
    setTesting(true);
    setTestStatus('Sending test order ping to Orders spreadsheet...');
    try {
      await fetch(ordersUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'TT-TEST-' + Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toLocaleString('en-IN'),
          fullName: 'Test Verification Customer',
          phoneNumber: '9999999999',
          homeNumber: 'Flat 101, Test Plaza',
          address: 'Main Store Road',
          city: 'Test City',
          state: 'State',
          pincode: '400001',
          paymentMethod: 'Cash on Delivery',
          totalAmount: 499,
          itemsSummary: '1x Test Verification Product',
        }),
      });
      setTestStatus('✅ Test order signal sent! Check your Orders Google Sheet.');
    } catch (e) {
      setTestStatus('❌ Could not connect: ' + String(e));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                Google Sheets Integration
              </h2>
              <p className="text-xs text-slate-300">
                Manage live products and customer orders with private Google Sheets
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('products');
              setTestStatus(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>2nd Sheet: Products Catalog</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              setTestStatus(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>1st Sheet: Orders Receiver</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Active ✓
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'products' ? (
            <>
              {/* Products Sheet Guide */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2.5">
                <h3 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>How to setup your Separate Products Google Sheet:</span>
                </h3>
                <ol className="text-xs text-emerald-900 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>
                    Create a new, separate Google Sheet at{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold underline text-emerald-800 inline-flex items-center gap-0.5"
                    >
                      sheets.new <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Click <strong>Extensions → Apps Script</strong> in that new sheet.
                  </li>
                  <li>
                    Copy the <strong>Products Apps Script</strong> below and paste it into <code>Code.gs</code>.
                  </li>
                  <li>
                    Click <strong>Deploy → New deployment → Web app</strong> (Set <em>"Execute as"</em> = <strong>Me</strong> and <em>"Who has access"</em> = <strong>Anyone</strong>).
                  </li>
                  <li>Copy the new Web App URL and paste it in the box below!</li>
                </ol>
              </div>

              {/* Products Web App URL Input Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Products Sheet Web App URL:
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="url"
                    value={prodUrl}
                    onChange={(e) => setProdUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveProductsUrl}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Save URL
                  </button>
                  <button
                    type="button"
                    disabled={syncingProducts}
                    onClick={handleSyncProducts}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {syncingProducts ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Sync Products ({products.length})</span>
                  </button>
                </div>

                {testStatus && (
                  <p
                    className={`text-xs font-medium p-2.5 rounded-lg ${
                      testStatus.startsWith('✅')
                        ? 'bg-emerald-100 text-emerald-800'
                        : testStatus.startsWith('❌')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {testStatus}
                  </p>
                )}
              </div>

              {/* Standalone Products Apps Script Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Code className="w-4 h-4 text-emerald-700" />
                    <span>Products Apps Script Code (Code.gs)</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-[11px] overflow-x-auto font-mono max-h-56 leading-relaxed">
                  {STANDALONE_PRODUCTS_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </>
          ) : (
            <>
              {/* Existing Orders Sheet Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Orders Sheet is Connected & Ready
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your existing Orders spreadsheet receives all customer orders placed on the store. It remains completely independent and safe.
                </p>
              </div>

              {/* Orders Webhook URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Orders Webhook URL:
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="url"
                    value={ordersUrl}
                    onChange={(e) => setOrdersUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbyaGS8.../exec"
                    className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveOrdersUrl}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Save URL
                  </button>
                  <button
                    type="button"
                    disabled={testing}
                    onClick={handleTestOrder}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {testing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Test Ping</span>
                  </button>
                </div>

                {testStatus && (
                  <p
                    className={`text-xs font-medium p-2.5 rounded-lg ${
                      testStatus.startsWith('✅')
                        ? 'bg-emerald-100 text-emerald-800'
                        : testStatus.startsWith('❌')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {testStatus}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

