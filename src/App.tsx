import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { CategoriesView } from './components/CategoriesView';
import { MyOrdersView } from './components/MyOrdersView';
import { LikedItemsView } from './components/LikedItemsView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { ShareModal } from './components/ShareModal';
import { CartNotificationToast } from './components/CartNotificationToast';
import { MapPin, Phone, ShieldCheck, Truck, RotateCcw, CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useShop();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-16">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'categories' && <CategoriesView />}
        {activeTab === 'orders' && <MyOrdersView />}
        {activeTab === 'liked' && <LikedItemsView />}
      </main>

      {/* Shopify Trust & Perks Bar */}
      <div className="border-t border-b border-slate-200 bg-white py-6 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Express Local Delivery</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Dispatched directly from mall partner stores</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Zero Advance Required</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Pay via Cash or UPI when your package arrives</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Hassle-Free Returns</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified authentic retail products</p>
          </div>
        </div>
      </div>

      {/* Shopify-Style Dark Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black text-sm">
                TT
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">TODAY'S TREND</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Direct-to-consumer store connecting local retail mall boutiques and specialty artisans with express doorstep delivery.
            </p>
            <div className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Main Mall Arcade, Central City</span>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Collections</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li><button onClick={() => { setActiveTab('home'); }} className="hover:text-white transition-colors cursor-pointer">Men & Woman Fashion</button></li>
              <li><button onClick={() => { setActiveTab('home'); }} className="hover:text-white transition-colors cursor-pointer">Saree & Fine Jewelry</button></li>
              <li><button onClick={() => { setActiveTab('home'); }} className="hover:text-white transition-colors cursor-pointer">Smart Electronics & Audio</button></li>
              <li><button onClick={() => { setActiveTab('home'); }} className="hover:text-white transition-colors cursor-pointer">Kitchen & Dining Essentials</button></li>
              <li><button onClick={() => { setActiveTab('home'); }} className="hover:text-white transition-colors cursor-pointer">Custom Gifts & Keepsakes</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Store Support</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Have questions about your order or need delivery assistance? Our store concierge is available daily.
            </p>
            <div className="pt-1 flex items-center gap-2 text-white font-bold text-xs">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Helpline: +91 9811223344</span>
            </div>
          </div>

          {/* Buyer Trust & Assurance */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Shopping Guarantee</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              100% verified authentic local products delivered straight to your home with full payment safety.
            </p>
            <ul className="space-y-2 pt-1 text-[11px] text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero advance payment required</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant dispatch from local mall</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Easy replacement on delivery check</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <span>© {new Date().getFullYear()} TODAY'S TREND. All rights reserved.</span>
          <span>Fast, Reliable & Trusted Local Shopping</span>
        </div>
      </footer>

      {/* Bottom Mobile Navigation */}
      <Navigation />

      {/* Modals & Overlays */}
      <CartNotificationToast />
      <CartDrawer />
      <CheckoutModal />
      <ProductDetailModal />
      <ImageGalleryModal />
      <ShareModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
