import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Star, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Flashlight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MenuItemCard from '@/components/MenuItemCard';
import type { Restaurant, Category, SpecialOffer, MenuItem } from '@shared/schema';

import { useUiSettings } from '@/context/UiSettingsContext';

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const { getSetting } = useUiSettings();

  const logoUrl = getSetting('header_logo_url', '');

  // Fetch data
  const { data: stores } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: offers } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers'],
  });

  const { data: featuredProducts } = useQuery<MenuItem[]>({
    queryKey: ['/api/products/featured'],
  });

  const activeOffers = offers?.filter(offer => offer.isActive) || [];

  const nextOffer = () => {
    if (activeOffers.length > 1) {
      setCurrentOfferIndex((prev) => (prev + 1) % activeOffers.length);
    }
  };

  const prevOffer = () => {
    if (activeOffers.length > 1) {
      setCurrentOfferIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* 1. Hero Section (Elegant Banner Cards) */}
      {activeOffers.length > 0 && (
        <section className="container mx-auto px-2 py-4 md:py-8">
          <div className="relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl bg-white border border-gray-100">
            <div 
              className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(${currentOfferIndex * 100}%)` }}
            >
              {activeOffers.map((offer) => (
                <div key={offer.id} className="w-full h-[250px] md:h-[500px] flex-shrink-0 relative overflow-hidden">
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[10s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-4 md:p-16 text-white text-right">
                    <div className="flex flex-col gap-1 items-end max-w-4xl mr-auto">
                      {offer.showBadge !== false && (
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary text-white border-none text-[10px] md:text-sm px-3 py-0.5 rounded-full shadow-lg shadow-primary/40 uppercase font-black italic">{offer.badgeText1 || 'طازج يومياً'}</Badge>
                          <Badge variant="outline" className="text-white border-white/50 text-[10px] md:text-sm px-3 py-0.5 rounded-full backdrop-blur-md font-black italic">{offer.badgeText2 || 'عروض حصرية'}</Badge>
                        </div>
                      )}
                      <h2 className="text-3xl md:text-7xl font-black mb-2 leading-[0.9] uppercase tracking-tighter drop-shadow-md italic select-none">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="h-8 md:h-20 w-auto mb-2 inline-block" />
                        ) : (
                          <>
                            <span className="text-[#388e3c]">طم</span>
                            <span className="text-[#d32f2f] -mr-1">طوم</span>
                          </>
                        )}
                        <br />
                        <span className="text-white">{offer.title}</span>
                      </h2>
                      <p className="text-sm md:text-2xl opacity-90 max-w-xl mb-4 leading-tight font-bold drop-shadow-sm line-clamp-2">{offer.description}</p>
                      <Button 
                        size="sm" 
                        className="md:size-lg w-fit bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 rounded-xl px-6 md:px-10 text-xs md:text-lg font-black h-10 md:h-16 shadow-xl hover:shadow-primary/40 group/btn italic uppercase"
                        onClick={() => setLocation('/search?q=offers')}
                      >
                        تسوق الآن
                        <ChevronLeft className="mr-2 h-4 w-4 md:h-6 md:w-6 group-hover/btn:-translate-x-2 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Elegant Navigation Arrows */}
            {activeOffers.length > 1 && (
              <>
                <button 
                  onClick={prevOffer}
                  className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-5 rounded-3xl text-white backdrop-blur-2xl transition-all border border-white/30 opacity-0 group-hover:opacity-100 z-10 shadow-2xl"
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>
                <button 
                  onClick={nextOffer}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-5 rounded-3xl text-white backdrop-blur-2xl transition-all border border-white/30 opacity-0 group-hover:opacity-100 z-10 shadow-2xl"
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              </>
            )}
            
            {/* Modern Pagination Indicators */}
            <div className="absolute bottom-10 left-10 flex gap-4">
              {activeOffers.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentOfferIndex(i)}
                  className={`h-1.5 transition-all duration-700 rounded-full ${currentOfferIndex === i ? 'w-16 bg-primary shadow-lg shadow-primary/50' : 'w-4 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Modern Categories Grid */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col items-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 uppercase tracking-tighter italic">تصفح حسب التصنيف</h2>
          <div className="h-1 md:h-2 w-20 md:w-32 bg-primary rounded-full shadow-lg shadow-primary/20" />
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-8">
          {categories?.filter(c => c.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((category) => (
            <div 
              key={category.id} 
              className="group relative flex flex-col items-center cursor-pointer"
              onClick={() => setLocation(`/category/${category.name}`)}
            >
              <div className="w-full aspect-square rounded-2xl md:rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden group-hover:shadow-xl group-hover:border-primary transition-all duration-500 transform group-hover:-translate-y-2">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="bg-primary/5 w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-8 md:h-12 w-8 md:w-12 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="mt-2 md:mt-4 text-center">
                <span className="text-xs md:text-lg font-black text-gray-900 group-hover:text-primary transition-colors block uppercase tracking-tighter italic truncate w-full px-1">{category.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="container mx-auto px-4 py-8 md:py-16 mb-16 md:mb-24">
        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
          <Button variant="ghost" className="text-primary font-black text-sm md:text-lg p-0 hover:bg-transparent hover:translate-x-1 transition-transform" onClick={() => setLocation('/search?q=popular')}>
             عرض الكل <ChevronLeft className="mr-1 h-4 w-4 md:h-6 md:w-6" />
          </Button>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right">
              <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter italic">وصل حديثاً</h2>
              <p className="text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">Freshly Added Today</p>
            </div>
            <div className="bg-primary shadow-lg p-2 md:p-4 rounded-xl md:rounded-[1.5rem] rotate-3">
              <TrendingUp className="h-4 w-4 md:h-8 md:w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
          {featuredProducts?.slice(0, 12).map((product) => (
            <MenuItemCard 
              key={product.id} 
              item={product} 
              restaurantId={product.restaurantId || ''} 
              restaurantName="طمطوم"
            />
          ))}
        </div>
      </section>
    </div>
  );
}