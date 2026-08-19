import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

export const LikedItemsView: React.FC = () => {
  const { likedProducts, setActiveTab } = useShop();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            id="liked-go-back-btn"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>My Wishlist</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {likedProducts.length}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved products from your browsing sessions
            </p>
          </div>
        </div>
      </div>

      {likedProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Save items that you like to access them anytime.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="mt-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Discover Products</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {likedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
