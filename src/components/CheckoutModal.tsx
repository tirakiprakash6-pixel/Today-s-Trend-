import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  ShieldCheck,
  Check,
  MessageCircle,
  PackageCheck,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CustomerDetails, Order } from '../types';
import { validateIndianMobile, validateIndianPincode } from '../utils/phoneValidator';
import { getWhatsAppOrderConfirmationUrl, STORE_OWNER_WHATSAPP_DISPLAY } from '../utils/googleSheetsSync';
import { lookupPincode, isCityBelongingToPincode, PincodeInfo } from '../utils/pincodeLookup';

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
    markWhatsAppConfirmed,
    setActiveTab,
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
    city: '',
    district: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Smart PIN Code & Postal Area state
  const [pincodeInfo, setPincodeInfo] = useState<PincodeInfo | null>(null);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    setCompletedOrder(null);
    setPincodeInfo(null);
    setIsCheckoutOpen(false);
  };

  // Automatically lookup postal details whenever a 6-digit PIN is entered
  const handlePincodeChange = async (rawVal: string) => {
    const cleanPin = rawVal.replace(/\D/g, '').slice(0, 6);
    
    setFormData((prev) => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length < 6) {
      setPincodeInfo(null);
      if (errors.pincode) {
        setErrors((prev) => ({ ...prev, pincode: '' }));
      }
      return;
    }

    // When exactly 6 digits are typed
    const basicValidation = validateIndianPincode(cleanPin);
    if (!basicValidation.isValid) {
      setErrors((prev) => ({ ...prev, pincode: basicValidation.error || 'Invalid PIN code' }));
      setPincodeInfo(null);
      return;
    }

    setIsLoadingPincode(true);
    try {
      const info = await lookupPincode(cleanPin);
      setIsLoadingPincode(false);
      setPincodeInfo(info);

      if (!info.isValid) {
        setErrors((prev) => ({ ...prev, pincode: info.error || 'Invalid Indian PIN code' }));
      } else {
        // Clear pincode and address errors
        setErrors((prev) => {
          const next = { ...prev };
          delete next.pincode;
          delete next.district;
          delete next.state;
          delete next.city;
          return next;
        });

        // Auto-fill State, District, and City from PIN Code
        setFormData((prev) => ({
          ...prev,
          state: info.state || prev.state,
          district: info.district || prev.district,
          city: info.city || info.places[0] || prev.city,
        }));
      }
    } catch (err) {
      setIsLoadingPincode(false);
    }
  };

  const handleCityChange = (newCity: string) => {
    setFormData((prev) => ({ ...prev, city: newCity }));

    if (errors.city) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.city;
        return next;
      });
    }

    if (formData.pincode.length === 6 && pincodeInfo && pincodeInfo.isValid && newCity.trim().length > 1) {
      const check = isCityBelongingToPincode(newCity, pincodeInfo);
      if (!check.matches) {
        setErrors((prev) => ({
          ...prev,
          city: `"${newCity}" does not match PIN ${formData.pincode} (${pincodeInfo.district || pincodeInfo.city}, ${pincodeInfo.state})`,
        }));
      }
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setFormData((prev) => ({ ...prev, district: newDistrict }));

    if (errors.district) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.district;
        return next;
      });
    }
  };

  const handleStateChange = (newState: string) => {
    setFormData((prev) => ({ ...prev, state: newState }));

    if (errors.state) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.state;
        return next;
      });
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Please enter your complete name';
    }

    // Strict Phone Number & Anti-Fake Filter
    const phoneVal = validateIndianMobile(formData.phone);
    if (!phoneVal.isValid) {
      errs.phone = phoneVal.error || 'Enter a valid 10-digit mobile number';
    }

    if (!formData.homeNumber.trim()) errs.homeNumber = 'House / Flat No. is required';
    if (!formData.address.trim()) errs.address = 'Street Address / Area is required';
    if (!formData.city.trim()) errs.city = 'City / Town is required';
    if (!formData.district?.trim()) errs.district = 'District is required';
    if (!formData.state.trim()) errs.state = 'State is required';

    // Strict Pincode validation
    const pinVal = validateIndianPincode(formData.pincode);
    if (!pinVal.isValid) {
      errs.pincode = pinVal.error || 'Enter a valid 6-digit pin code';
    } else if (pincodeInfo && !pincodeInfo.isValid) {
      errs.pincode = pincodeInfo.error || 'Invalid Indian PIN code';
    }

    // Strict City vs PIN code mismatch check
    if (formData.pincode.length === 6 && formData.city.trim() && pincodeInfo && pincodeInfo.isValid) {
      const check = isCityBelongingToPincode(formData.city, pincodeInfo);
      if (!check.matches) {
        errs.city = `City must belong to PIN ${formData.pincode} (${pincodeInfo.district || pincodeInfo.city}, ${pincodeInfo.state})`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await placeOrder(formData);
      if (res.success && res.order) {
        setCompletedOrder(res.order);
        // Reset form to blank for next checkout
        setFormData({
          fullName: '',
          phone: '',
          homeNumber: '',
          address: '',
          city: '',
          district: '',
          state: '',
          pincode: '',
          paymentMethod: 'cod',
        });
      } else {
        alert(res.message || 'Could not place order. Please try again.');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppOpen = (order: Order) => {
    markWhatsAppConfirmed(order.id);
    const waUrl = getWhatsAppOrderConfirmationUrl(order);
    window.open(waUrl, '_blank');
    // Automatically close the dialog and reset so when user returns from WhatsApp,
    // they are back on the store and cannot repeatedly click or spam messages
    handleClose();
    setActiveTab('home');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!completedOrder && (
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                id="checkout-modal-go-back-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Go Back</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                {completedOrder ? 'Order Confirmation' : 'Secure Checkout'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {completedOrder ? (
            <div className="space-y-5 py-1">
              {/* Order Placed Header */}
              <div className="text-center space-y-1 pb-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <MessageCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Complete whatsapp configuration
                </h3>
              </div>

              {/* WhatsApp Confirmation Card (Professional & Clean) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    WhatsApp Status:
                  </span>

                  <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> Pending Verification
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleWhatsAppOpen(completedOrder)}
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
                  id="whatsapp-order-confirm-btn"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>confirm</span>
                </button>
              </div>

              {/* Order Delivery Details */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Order ID:</span>
                  <span className="font-bold text-slate-900">#{completedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Recipient:</span>
                  <span className="font-semibold text-slate-900">{completedOrder.customer.fullName} (+91 {completedOrder.customer.phone})</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 border-t border-slate-200/60 pt-2">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[240px]">
                    {completedOrder.customer.homeNumber ? `${completedOrder.customer.homeNumber}, ` : ''}{completedOrder.customer.address}, {completedOrder.customer.city}{completedOrder.customer.district && completedOrder.customer.district !== completedOrder.customer.city ? `, ${completedOrder.customer.district}` : ''}, {completedOrder.customer.state} - {completedOrder.customer.pincode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 border-t border-slate-200/60 pt-2">
                  <span>Total Amount (COD):</span>
                  <span className="font-bold text-slate-900 text-sm">₹{completedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setActiveTab('home');
                  }}
                  className="w-full py-2.5 text-center text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order Items Preview */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Order Summary
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {itemsToBuy.length} {itemsToBuy.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="divide-y divide-slate-200/70">
                  {itemsToBuy.map((item, idx) => (
                    <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details Form */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">
                  Delivery Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
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
                        placeholder="Your Name"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-700">
                        Mobile Number *
                      </label>
                      {formData.phone.length === 10 && validateIndianMobile(formData.phone).isValid && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" /> Valid
                        </span>
                      )}
                    </div>
                    <div className="relative flex rounded-lg">
                      <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({
                            ...formData,
                            phone: val,
                          });
                          if (errors.phone) {
                            const check = validateIndianMobile(val);
                            if (check.isValid) {
                              setErrors((prev) => ({ ...prev, phone: '' }));
                            }
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className={`w-full text-xs px-3 py-2 bg-white border ${
                          errors.phone
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-slate-900'
                        } rounded-r-lg focus:outline-none font-mono transition-colors`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* 3. Home Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      House / Flat No. *
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.homeNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, homeNumber: e.target.value })
                        }
                        placeholder="e.g. Flat 402, House 12"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-700">
                        Pin Code *
                      </label>
                      {isLoadingPincode && (
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Verifying...
                        </span>
                      )}
                      {!isLoadingPincode && pincodeInfo?.isValid && (
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" /> {pincodeInfo.district || pincodeInfo.city}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="6-digit PIN"
                        className={`w-full text-xs pl-8 pr-3 py-2 bg-white border ${
                          errors.pincode
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-slate-900'
                        } rounded-lg focus:outline-none font-mono transition-colors`}
                      />
                    </div>
                    {errors.pincode && (
                      <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.pincode}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Street Address / Area *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Street name, landmark, area"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
                  />
                  {errors.address && (
                    <p className="text-[10px] text-rose-600 font-medium">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* 6. City / Town, District, State (3 Separate Fields) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* City / Town */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-700">
                        City / Town *
                      </label>
                      {pincodeInfo?.isValid && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          Verified PIN
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      list="pincode-places-list"
                      value={formData.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      placeholder="e.g. Banhatti"
                      className={`w-full text-xs px-3 py-2 bg-white border ${
                        errors.city
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-slate-900'
                      } rounded-lg focus:outline-none transition-colors`}
                    />
                    {pincodeInfo?.places && pincodeInfo.places.length > 0 && (
                      <datalist id="pincode-places-list">
                        {pincodeInfo.places.map((place, idx) => (
                          <option key={idx} value={place} />
                        ))}
                      </datalist>
                    )}
                    {errors.city && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-700">
                        District *
                      </label>
                      <span className="text-[10px] text-slate-400">Auto</span>
                    </div>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      placeholder="e.g. Bagalkot"
                      className={`w-full text-xs px-3 py-2 bg-slate-50 border ${
                        errors.district
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-slate-900'
                      } rounded-lg focus:outline-none transition-colors`}
                    />
                    {errors.district && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        {errors.district}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-700">
                        State *
                      </label>
                      <span className="text-[10px] text-slate-400">Auto</span>
                    </div>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className={`w-full text-xs px-3 py-2 bg-slate-50 border ${
                        errors.state
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-slate-900'
                      } rounded-lg focus:outline-none transition-colors`}
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
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Total Payable:</span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{totalAmount}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>
                    Cash on Delivery order verification via WhatsApp before dispatch.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <span>Confirm Order (Cash on Delivery)</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Shopping</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
