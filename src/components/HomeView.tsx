import React from 'react';
import { BannerSlider } from './BannerSlider';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';
import { MAIN_CATEGORIES } from '../data/categories';
import { SlidersHorizontal, Sparkles, Shirt, Headphones, Utensils, Gift, Grid, ArrowLeft } from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useShop();

  // Filter products by search & category
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mallShopName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.ratingCount - a.ratingCount; // default popular
  });

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Men & woman Fashion':
        return <Shirt className="w-4 h-4" />;
      case 'Saree & jewelry':
        return <Sparkles className="w-4 h-4" />;
      case 'Electronics & sports':
        return <Headphones className="w-4 h-4" />;
      case 'Kitchen items':
        return <Utensils className="w-4 h-4" />;
      case 'Custom products':
        return <Gift className="w-4 h-4" />;
      default:
        return <Grid className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner */}
      {!searchQuery && <BannerSlider />}

      {/* Shopify Featured Collections Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Featured Collections
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* All Collection */}
          <button
            onClick={() => setSelectedCategory('All')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                selectedCategory === 'All'
                  ? 'bg-white/10 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">All Catalog</p>
              <p
                className={`text-[10px] mt-0.5 ${
                  selectedCategory === 'All' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {products.length} Products
              </p>
            </div>
          </button>

          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getCategoryIcon(cat.name)}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight line-clamp-1">
                    {cat.displayName}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {count} Products
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Catalog Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                id="home-filter-go-back-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Go Back to All</span>
              </button>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : selectedCategory === 'All'
                  ? 'Featured Catalog'
                  : `${selectedCategory}`}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {sortedProducts.length} items • Direct store fulfillment
              </p>
            </div>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              <option value="popularity">Featured & Best Selling</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingProducts && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse flex flex-col"
              >
                <div className="aspect-square bg-slate-100" />
                <div className="p-3.5 space-y-2.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-lg w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              No products found matching your search
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
              }}
              className="text-xs text-slate-900 font-bold underline cursor-pointer"
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
