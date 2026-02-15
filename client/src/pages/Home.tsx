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
        <section className="container mx-auto px-4 py-6 md:py-10">
          <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl bg-white">
            <div 
              className="flex transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(${currentOfferIndex * 100}%)` }}
            >
              {activeOffers.map((offer) => (
                <div key={offer.id} className="w-full h-[300px] md:h-[550px] flex-shrink-0 relative">
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-full object-cover transform scale-100 hover:scale-105 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16 text-white text-right">
                    <Badge className="w-fit mb-4 bg-primary text-white border-none text-lg px-4 py-1 rounded-full self-end">عرض خاص</Badge>
                    <h2 className="text-3xl md:text-6xl font-black mb-4 leading-tight">{offer.title}</h2>
                    <p className="text-sm md:text-2xl opacity-90 max-w-2xl mb-8 leading-relaxed">{offer.description}</p>
                    <Button 
                      size="lg" 
                      className="w-fit self-end bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 rounded-xl px-10 text-xl font-bold h-14"
                      onClick={() => setLocation('/search?q=offers')}
                    >
                      تسوق الآن
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Elegant Navigation Arrows */}
            {activeOffers.length > 1 && (
              <>
                <button 
                  onClick={prevOffer}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 p-4 rounded-full text-white backdrop-blur-xl transition-all border border-white/20 opacity-0 group-hover:opacity-100 z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button 
                  onClick={nextOffer}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 p-4 rounded-full text-white backdrop-blur-xl transition-all border border-white/20 opacity-0 group-hover:opacity-100 z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            
            {/* Modern Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {activeOffers.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentOfferIndex(i)}
                  className={`h-2 transition-all duration-500 rounded-full ${currentOfferIndex === i ? 'w-12 bg-primary' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Modern Categories Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 text-center">تصفح حسب التصنيف</h2>
          <div className="h-1.5 w-24 bg-primary rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {categories?.filter(c => c.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((category) => (
            <div 
              key={category.id} 
              className="group relative flex flex-col items-center cursor-pointer"
              onClick={() => setLocation(`/category/${category.name}`)}
            >
              <div className="w-full aspect-square rounded-[2rem] bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden group-hover:shadow-xl group-hover:border-primary/20 transition-all duration-500 transform group-hover:-translate-y-2">
                {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                  <img 
                    src={category.icon} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="bg-primary/5 w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="mt-4 text-center">
                <span className="text-lg font-black text-gray-800 group-hover:text-primary transition-colors block">{category.name}</span>
                <span className="text-xs text-gray-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">تصفح المنتجات</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="container mx-auto px-4 py-12 mb-20">
        <div className="flex items-center justify-between mb-10 border-b pb-6">
          <Button variant="link" className="text-primary font-black text-lg p-0" onClick={() => setLocation('/search?q=popular')}>
            <ChevronLeft className="h-5 w-5 mr-1" /> عرض الكل 
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black">وصل حديثاً</h2>
            <div className="bg-primary/10 p-2 rounded-xl">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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