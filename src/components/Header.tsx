import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, PackageCheck, X, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { MAIN_CATEGORIES } from '../data/categories';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    likedProductIds,
    cartTotalCount,
    orders,
    setIsCartOpen,
    selectedCategory,
    setSelectedCategory,
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const activeOrdersCount = orders.filter((order) => order.status !== 'cancelled').length;

  // Trigger cart button bump animation on count change
  useEffect(() => {
    if (cartTotalCount === 0) return;
    setIsCartBumping(true);
    const timer = setTimeout(() => setIsCartBumping(false), 500);
    return () => clearTimeout(timer);
  }, [cartTotalCount]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Shopify-style Announcement Bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span className="opacity-90">✨ Direct From Mall Retailers • Free Local Doorstep Delivery • Cash & UPI on Delivery</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo (Shopify D2C Style) */}
        <button
          onClick={() => {
            setActiveTab('home');
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
          id="brand-logo-btn"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs">
            TT
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block leading-none">
              TODAY'S <span className="font-light text-slate-600">TREND</span>
            </span>
          </div>
        </button>

        {/* Center Desktop Navigation Collections */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              setSelectedCategory('All');
              if (activeTab !== 'home') setActiveTab('home');
            }}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'home' && selectedCategory === 'All'
                ? 'text-slate-900 font-bold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            All Products
          </button>
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                if (activeTab !== 'home') setActiveTab('home');
              }}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'home' && selectedCategory === cat.name
                  ? 'text-slate-900 font-bold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              {cat.displayName}
            </button>
          ))}
        </nav>

        {/* Search Bar (Desktop) */}
        <div className="flex-1 max-w-xs relative hidden sm:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="header-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'home' && activeTab !== 'categories') {
                  setActiveTab('home');
                }
              }}
              placeholder="Search store..."
              className="w-full bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-900 text-xs pl-8 pr-7 py-2 rounded-full border border-transparent focus:border-slate-300 focus:ring-1 focus:ring-slate-300 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Icon Actions: Liked, My Orders, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Liked Items */}
          <button
            onClick={() => setActiveTab(activeTab === 'liked' ? 'home' : 'liked')}
            id="liked-items-btn"
            className={`p-2 rounded-full transition-colors cursor-pointer relative ${
              activeTab === 'liked'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Wishlist"
          >
            <Heart
              className={`w-5 h-5 ${
                likedProductIds.length > 0
                  ? 'text-rose-500 fill-rose-500'
                  : 'text-slate-700'
              }`}
            />
            {likedProductIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {likedProductIds.length}
              </span>
            )}
          </button>

          {/* My Orders Button in Header */}
          <button
            onClick={() => setActiveTab(activeTab === 'orders' ? 'home' : 'orders')}
            id="my-orders-header-btn"
            className={`p-2 rounded-full transition-colors cursor-pointer relative ${
              activeTab === 'orders'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="My Orders"
          >
            <PackageCheck className="w-5 h-5 text-slate-700" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Shopify Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            id="open-cart-btn"
            className={`bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-xs ${
              isCartBumping ? 'scale-110 bg-emerald-700 ring-4 ring-emerald-300/40 shadow-lg' : 'scale-100'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 transition-transform ${isCartBumping ? 'animate-bounce text-emerald-200' : ''}`} />
            <span className="hidden sm:inline">Cart</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
              isCartBumping ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/20 text-white'
            }`}>
              {cartTotalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expandable */}
      {isSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-slate-100">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'home' && activeTab !== 'categories') {
                  setActiveTab('home');
                }
              }}
              placeholder="Search store..."
              className="w-full bg-slate-100 text-slate-900 text-xs pl-9 pr-8 py-2 rounded-full border border-slate-200 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Collection Filter Strip */}
      <div className="lg:hidden border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
            <button
              onClick={() => {
                setSelectedCategory('All');
                if (activeTab !== 'home') setActiveTab('home');
              }}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === 'home' && selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {MAIN_CATEGORIES.map((cat) => {
              const isSelected = activeTab === 'home' && selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    if (activeTab !== 'home') setActiveTab('home');
                  }}
                  className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.displayName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
