import React, { useState } from 'react';
import { Heart, ShoppingBag, Zap, Share2, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    toggleLike,
    isLiked,
    addToCart,
    openDirectCheckout,
    setSelectedProductForDetail,
    setShareModalProduct,
    cart,
  } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isJustAdded, setIsJustAdded] = useState(false);
  const liked = isLiked(product.id);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1400);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.images[activeImageIdx]}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-500 group-hover:scale-103"
          onClick={() => setSelectedProductForDetail(product)}
          loading="lazy"
        />

        {/* Floating Quick Action Icons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(product.id);
            }}
            id={`like-btn-${product.id}`}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer ${
              liked
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600'
            }`}
            title={liked ? 'Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                liked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShareModalProduct(product);
            }}
            id={`share-btn-${product.id}`}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-950 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Image Hover Swatch Bar */}
        <div className="absolute bottom-2 left-2 right-2 bg-slate-950/70 backdrop-blur-xs rounded-md p-1 flex items-center justify-center gap-1.5 z-10 opacity-90 transition-opacity">
          {product.images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setActiveImageIdx(idx)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx(idx);
              }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded overflow-hidden border transition-all cursor-pointer ${
                activeImageIdx === idx
                  ? 'border-white ring-1 ring-white'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
              title={`View angle ${idx + 1}`}
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

      {/* Product Details (Shopify D2C layout) */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor info & Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="truncate max-w-[120px] font-medium text-slate-500">
              {product.mallShopName}
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setSelectedProductForDetail(product)}
            className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 hover:underline cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-slate-900">
              ₹{product.price}
            </span>
            <span className="text-xs text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
              {product.discountPercent}% OFF
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            id={`add-to-cart-${product.id}`}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 select-none ${
              isJustAdded
                ? 'bg-emerald-600 text-white border border-emerald-600 shadow-md scale-105'
                : inCartQuantity > 0
                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-bold hover:bg-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs hover:border-slate-400'
            }`}
          >
            {isJustAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white animate-bounce stroke-[3]" />
                <span className="font-bold">Added! ✓</span>
              </>
            ) : inCartQuantity > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>In Cart ({inCartQuantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={() => openDirectCheckout(product)}
            id={`order-now-${product.id}`}
            className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
