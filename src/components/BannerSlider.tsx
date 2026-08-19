import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const BannerSlider: React.FC = () => {
  const { setActiveTab, setSelectedCategory } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: "NEW SEASON COLLECTIONS",
      title: "Curated Mall Marketplace",
      subtitle: "Discover high quality fashion, ethnic wear, jewelry, tech & home goods delivered direct from store.",
      category: 'All',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      tag: "ETHNIC & BRIDAL EDIT",
      title: "Festive Silk Sarees & Kundan Jewelry",
      subtitle: "Traditional banarasi weaves and handcrafted jewelry sets directly from boutique weavers.",
      category: 'Saree & jewelry',
      image: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      tag: "MODERN LIVING",
      title: "Smart Gear, Cookware & Custom Gifts",
      subtitle: "Premium home essentials, wireless tech, and bespoke personalized products.",
      category: 'Kitchen items',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1400&auto=format&fit=crop&q=80',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[220px] sm:min-h-[260px] md:min-h-[300px] border border-slate-800 shadow-sm">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 flex items-center ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-xl">
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-slate-300 uppercase">
              {slide.tag}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mt-1.5">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 line-clamp-2 leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="mt-4">
              <button
                onClick={() => {
                  if (slide.category !== 'All') {
                    setSelectedCategory(slide.category);
                  }
                  setActiveTab('home');
                }}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:gap-2.5"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next controls */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-colors hidden sm:block cursor-pointer backdrop-blur-xs"
        title="Previous"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-colors hidden sm:block cursor-pointer backdrop-blur-xs"
        title="Next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
