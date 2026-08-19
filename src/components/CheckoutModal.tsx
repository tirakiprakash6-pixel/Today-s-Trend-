import React, { useState } from 'react';
import {
  X,
  Truck,
  MapPin,
  Phone,
  User,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CustomerDetails } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutProduct,
    cart,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    placeOrder,
  } = useShop();

  // Active items being purchased
  const itemsToBuy = checkoutProduct
    ? [
        {
          product: checkoutProduct,
          quantity: 1,
          selectedSize: checkoutProduct.sizes ? checkoutProduct.sizes[0] : undefined,
          selectedColor: checkoutProduct.colors ? checkoutProduct.colors[0] : undefined,
        },
      ]
    : cart;

  const totalAmount = checkoutProduct ? checkoutProduct.price : cartTotal;
  const originalTotal = checkoutProduct ? checkoutProduct.originalPrice : cartSubtotal;
  const totalSavings = checkoutProduct ? checkoutProduct.originalPrice - checkoutProduct.price : cartDiscount;

  // Form State - Always start completely blank
  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    homeNumber: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessNotice, setOrderSuccessNotice] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errs.phone = 'Enter valid 10-digit mobile number';
    }
    if (!formData.homeNumber.trim()) errs.homeNumber = 'Home / Flat / Building No. is required';
    if (!formData.address.trim()) errs.address = 'Street Address / Area is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.pincode.trim()) {
      errs.pincode = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ''))) {
      errs.pincode = 'Enter 6-digit pin code';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await placeOrder(formData, itemsToBuy);
      setOrderSuccessNotice('Your order has been placed successfully!');
      // Reset form to blank for next checkout
      setFormData({
        fullName: '',
        phone: '',
        homeNumber: '',
        address: '',
        state: '',
        city: '',
        pincode: '',
        paymentMethod: 'cod',
      });
      setTimeout(() => {
        setOrderSuccessNotice(null);
        setIsCheckoutOpen(false);
      }, 1800);
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Checkout
            </h2>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {orderSuccessNotice ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Order Confirmed!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {orderSuccessNotice}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Items Preview */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Order Summary ({itemsToBuy.length} {itemsToBuy.length === 1 ? 'item' : 'items'})
                </p>
                <div className="divide-y divide-slate-200">
                  {itemsToBuy.map((item, idx) => (
                    <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict 7 Customer Details Form */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Delivery Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="e.g. Rahul Sharma"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* 2. Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="10-digit mobile number"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* 3. Home Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Home / Flat / Building No. *
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.homeNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, homeNumber: e.target.value })
                        }
                        placeholder="Flat 402, Building A"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    {errors.homeNumber && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.homeNumber}
                      </p>
                    )}
                  </div>

                  {/* 4. Pin Code */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Pin Code *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pincode: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="6-digit PIN code"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    {errors.pincode && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Street Address / Area *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Colony, Landmark, Street"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                  {errors.address && (
                    <p className="text-[10px] text-rose-600 font-medium">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 6. City */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="e.g. Mumbai"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    {errors.city && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* 7. State */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="e.g. Maharashtra"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    {errors.state && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Total Payable:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{totalAmount}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Order</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
