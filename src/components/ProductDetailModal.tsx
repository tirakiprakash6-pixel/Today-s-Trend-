import React, { useState } from 'react';
import {
  X,
  Star,
  Truck,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Zap,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForDetail,
    setSelectedProductForDetail,
    toggleLike,
    isLiked,
    addToCart,
    openDirectCheckout,
    setShareModalProduct,
    cart,
  } = useShop();

  const product = selectedProductForDetail;
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors ? product.colors[0] : undefined
  );
  const [isJustAdded, setIsJustAdded] = useState(false);

  if (!product) return null;

  const liked = isLiked(product.id);
  const cartItem = cart.find(
    (i) =>
      i.product.id === product.id &&
      i.selectedSize === selectedSize &&
      i.selectedColor === selectedColor
  );

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-900 font-bold">{product.category}</span>
            <span>/</span>
            <span>{product.subcategory}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShareModalProduct(product)}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedProductForDetail(null)}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Gallery */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Nav Arrows */}
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length)
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev + 1) % product.images.length)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2.5">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-slate-900 shadow-xs scale-102'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details (Shopify D2C style) */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                {/* Vendor name */}
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {product.mallShopName} • {product.mallFloor}
                </p>

                {/* Title */}
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1 leading-snug">
                  {product.name}
                </h1>

                {/* Ratings */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {product.rating}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({product.ratingCount.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    ₹{product.price}
                  </span>
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Save {product.discountPercent}%
                  </span>
                </div>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-5">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Size: <span className="font-normal text-slate-500">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            selectedSize === s
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Color: <span className="font-normal text-slate-500">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            selectedColor === c
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Shipping & Payment assurance */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-700" />
                    <span>Free Doorstep Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Shopify style dual actions) */}
              <div className="space-y-2.5 pt-4 border-t border-slate-200">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98 select-none ${
                    isJustAdded
                      ? 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-md scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white animate-bounce stroke-[3]" />
                      <span className="font-extrabold tracking-wide">Added to Cart! ✓</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedProductForDetail(null);
                    openDirectCheckout(product);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Buy It Now • ₹{product.price}</span>
                </button>

                <div className="flex items-center justify-center text-xs pt-1 px-1">
                  <button
                    onClick={() => toggleLike(product.id)}
                    className="text-slate-600 hover:text-rose-600 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{liked ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
