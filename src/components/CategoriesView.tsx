import React, { useState } from 'react';
import { MAIN_CATEGORIES } from '../data/categories';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';
import { Shirt, Sparkles, Headphones, Utensils, Gift, Grid } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory } = useShop();

  const activeMainCategory =
    selectedCategory === 'All' ? MAIN_CATEGORIES[0].name : selectedCategory;

  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');

  const currentCategoryInfo =
    MAIN_CATEGORIES.find((c) => c.name === activeMainCategory) || MAIN_CATEGORIES[0];

  const categoryProducts = products.filter((p) => {
    const matchesCategory = p.category === activeMainCategory;
    const matchesSubcategory =
      activeSubcategory === 'All' || p.subcategory === activeSubcategory;
    return matchesCategory && matchesSubcategory;
  });

  const getCategoryIcon = (name: string) => {
    switch (name) {
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
    <div className="space-y-6">
      {/* Categories Header */}
      <div>
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Shop by Collection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse through our verified departments and product categories
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = activeMainCategory === cat.name;
            return (
              <button
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setActiveSubcategory('All');
                }}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getCategoryIcon(cat.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-semibold truncate leading-tight">
                    {cat.displayName}
                  </h3>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {cat.itemCount} items
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-slate-500 shrink-0">
          Filters:
        </span>
        <button
          onClick={() => setActiveSubcategory('All')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            activeSubcategory === 'All'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All ({products.filter((p) => p.category === activeMainCategory).length})
        </button>

        {currentCategoryInfo.subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubcategory(sub)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              activeSubcategory === sub
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
          <span>
            Showing {categoryProducts.length} items in{' '}
            <strong className="text-slate-800">{activeMainCategory}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
