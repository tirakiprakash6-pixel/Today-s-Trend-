import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ShareModal: React.FC = () => {
  const { shareModalProduct, setShareModalProduct } = useShop();
  const [copied, setCopied] = useState(false);

  if (!shareModalProduct) return null;

  const product = shareModalProduct;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out "${product.name}" at TODAY'S TREND Local Mall! Only ₹${product.price} (${product.discountPercent}% OFF) with Free Mall Delivery.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 space-y-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-sm text-slate-900">Share Product</h3>
          <button
            onClick={() => setShareModalProduct(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80';
            }}
            className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 truncate">
              {product.name}
            </h4>
            <p className="text-xs font-bold text-[#9f2089] mt-0.5">
              ₹{product.price}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleWhatsAppShare}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-300 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
