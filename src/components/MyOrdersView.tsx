import React, { useState } from 'react';
import { PackageCheck, ShoppingBag, XCircle, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { OrderStatus } from '../types';

export const MyOrdersView: React.FC = () => {
  const { orders, cancelOrder, setActiveTab } = useShop();
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const activeOrdersCount = orders.filter((order) => order.status !== 'cancelled').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Order Placed
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Packed
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Cancelled
          </span>
        );
    }
  };

  const handleCancelClick = (orderId: string) => {
    cancelOrder(orderId);
    setConfirmCancelId(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span>My Orders</span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {activeOrdersCount} Active
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Order history and status
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You haven't placed any orders yet. Browse products to get started.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Shopping</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const canCancel = order.status !== 'cancelled' && order.status !== 'delivered';
            const isConfirming = confirmCancelId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs"
              >
                {/* Order Status & Date Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <span className="text-xs text-slate-500">
                    Ordered on {order.createdAt}
                  </span>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Products in this order: ONLY Product Image, Product Name, and Qty */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3.5"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80';
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                          {item.product.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-600 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Summary & Cancel Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Total:</span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  {/* Cancel Order Action */}
                  {canCancel && (
                    <div>
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Confirm cancel?
                          </span>
                          <button
                            onClick={() => handleCancelClick(order.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                          >
                            Yes, Cancel
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                          >
                            Keep Order
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(order.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Order Cancelled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
