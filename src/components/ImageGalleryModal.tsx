import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Zap, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ImageGalleryModal: React.FC = () => {
  const { activeImageModal, setActiveImageModal, openDirectCheckout } = useShop();

  if (!activeImageModal) return null;

  const { product, initialIndex } = activeImageModal;
  const [currentIdx, setCurrentIdx] = useState(initialIndex || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveImageModal(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            id="gallery-go-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <div>
            <h3 className="text-sm sm:text-base font-bold truncate max-w-md">
              {product.name}
            </h3>
            <p className="text-xs text-slate-300">
              Image {currentIdx + 1} of 4 • {product.mallShopName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveImageModal(null)}
          className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 max-w-4xl mx-auto w-full">
        <img
          src={product.images[currentIdx]}
          alt={`Product photo ${currentIdx + 1}`}
          className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
        />

        {/* Prev / Next Controls */}
        <button
          onClick={() => setCurrentIdx((prev) => (prev - 1 + 4) % 4)}
          className="absolute left-2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIdx((prev) => (prev + 1) % 4)}
          className="absolute right-2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full transition-colors cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom 4-Thumbnails and Fast Buy */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-4">
        {/* 4 Thumbnails */}
        <div className="flex items-center gap-2">
          {product.images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                currentIdx === idx
                  ? 'border-yellow-400 scale-105 shadow-lg'
                  : 'border-white/40 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Quick Buy CTA */}
        <button
          onClick={() => {
            setActiveImageModal(null);
            openDirectCheckout(product);
          }}
          className="bg-[#9f2089] hover:bg-[#bf26a7] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
          <span>Order Now (₹{product.price})</span>
        </button>
      </div>
    </div>
  );
};
