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

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

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
        <section className="container mx-auto px-4 py-6 md:py-12">
          <div className="relative group overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
            <div 
              className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(${currentOfferIndex * 100}%)` }}
            >
              {activeOffers.map((offer) => (
                <div key={offer.id} className="w-full h-[350px] md:h-[600px] flex-shrink-0 relative overflow-hidden">
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[10s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20 text-white text-right">
                    <div className="flex flex-col gap-2 items-end max-w-4xl mr-auto">
                      <div className="flex items-center gap-3 mb-4 animate-bounce">
                        <Badge className="bg-primary text-white border-none text-sm md:text-xl px-6 py-2 rounded-2xl shadow-xl shadow-primary/40 uppercase tracking-widest font-black italic">طازج يومياً</Badge>
                        <Badge variant="outline" className="text-white border-white/50 text-sm md:text-xl px-6 py-2 rounded-2xl backdrop-blur-md font-black italic">عروض حصرية</Badge>
                      </div>
                      <h2 className="text-5xl md:text-9xl font-black mb-6 leading-[0.85] uppercase tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] italic select-none">
                        <span className="text-[#388e3c]">طم</span>
                        <span className="text-[#d32f2f] -mr-1 md:-mr-3">طوم</span>
                        <br />
                        {offer.title}
                      </h2>
                      <p className="text-lg md:text-3xl opacity-90 max-w-2xl mb-10 leading-relaxed font-bold drop-shadow-lg">{offer.description}</p>
                      <Button 
                        size="lg" 
                        className="w-fit bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 rounded-2xl px-12 text-xl font-black h-20 shadow-2xl hover:shadow-primary/40 group/btn italic uppercase tracking-widest border-none"
                        onClick={() => setLocation('/search?q=offers')}
                      >
                        تسوق الآن
                        <ChevronLeft className="mr-4 h-8 w-8 group-hover/btn:-translate-x-3 transition-transform" />
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
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tighter italic">تصفح حسب التصنيف</h2>
          <div className="h-2 w-32 bg-primary rounded-full shadow-lg shadow-primary/20" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
          {categories?.filter(c => c.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((category) => (
            <div 
              key={category.id} 
              className="group relative flex flex-col items-center cursor-pointer"
              onClick={() => setLocation(`/category/${category.name}`)}
            >
              <div className="w-full aspect-square rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary transition-all duration-700 transform group-hover:-translate-y-4">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" 
                  />
                ) : category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                  <img 
                    src={category.icon} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" 
                  />
                ) : (
                  <div className="bg-primary/5 w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all duration-700" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <div className="mt-6 text-center">
                <span className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors block uppercase tracking-tighter italic">{category.name}</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 block opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">Shop Now</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="container mx-auto px-4 py-16 mb-24">
        <div className="flex items-center justify-between mb-12 border-b-2 border-gray-100 pb-8">
          <Button variant="ghost" className="text-primary font-black text-lg p-0 hover:bg-transparent hover:translate-x-2 transition-transform" onClick={() => setLocation('/search?q=popular')}>
             عرض الكل <ChevronLeft className="mr-2 h-6 w-6" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">وصل حديثاً</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Freshly Added Today</p>
            </div>
            <div className="bg-primary shadow-xl shadow-primary/30 p-4 rounded-[1.5rem] rotate-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-16">
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