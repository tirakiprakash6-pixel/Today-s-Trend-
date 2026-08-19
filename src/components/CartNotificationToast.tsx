import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShoppingBag, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartNotificationToast: React.FC = () => {
  const { cartToast, dismissCartToast, setIsCartOpen } = useShop();

  return (
    <AnimatePresence>
      {cartToast && (
        <motion.div
          key={cartToast.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl p-3.5 border border-slate-700/80 pointer-events-auto"
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={cartToast.product.images[0]}
                alt={cartToast.product.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white p-0.5 rounded-full shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  Added to Cart!
                </span>
                <button
                  onClick={dismissCartToast}
                  className="text-slate-400 hover:text-white p-0.5 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-xs font-semibold text-white line-clamp-1 mt-0.5">
                {cartToast.product.name}
              </h4>

              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300">
                  ₹{cartToast.product.price}
                </span>

                <button
                  onClick={() => {
                    dismissCartToast();
                    setIsCartOpen(true);
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-bold py-1 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>View Cart</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
