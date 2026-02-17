import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  Search, 
  Receipt, 
  User, 
  Menu, 
  Settings, 
  Shield, 
  MapPin, 
  Clock, 
  Truck, 
  UserCog, 
  ShoppingCart,
  Heart,
  PhoneCall,
  Info,
  ChevronLeft,
  ChevronRight,
  Globe,
  Share2,
  MessageCircle,
  MoreVertical,
  X,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';
import CartButton from './CartButton';
import { useToast } from '@/hooks/use-toast';
import { useUiSettings } from '@/context/UiSettingsContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './TopBar';
import Navbar from './Navbar';
import { apiRequest } from '@/lib/queryClient';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { state } = useCart();
  const { user } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();
  const getItemCount = () => state.items.reduce((sum, item) => sum + item.quantity, 0);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  
  // Fetch UI Settings for support and share
  const { data: uiSettings } = useQuery<any[]>({
    queryKey: ['/api/ui-settings'],
  });

  const getSetting = (key: string, defaultValue: string) => {
    return uiSettings?.find(s => s.key === key)?.value || defaultValue;
  };

  const whatsappLink = getSetting('support_whatsapp', 'https://wa.me/967777777777');
  const phoneLink = getSetting('support_phone', 'tel:+967777777777');
  const shareText = getSetting('share_text', 'تسوق أفضل الفواكه والخضروات الطازجة من تطبيق طمطوم!');
  const shareUrl = getSetting('share_url', window.location.origin);
  const sidebarImageUrl = getSetting('sidebar_image_url', 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=400');
  
  const isAdminPage = location.startsWith('/admin');
  const isDeliveryPage = location.startsWith('/delivery');
  const isDriverPage = location.startsWith('/driver');

  if (isAdminPage || isDeliveryPage || isDriverPage) {
    return <>{children}</>;
  }

  const sidebarMenuItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: Receipt, label: t('orders'), path: '/orders' },
    { icon: Heart, label: t('favorites'), path: '/favorites' },
    { icon: User, label: t('account'), path: '/profile' },
    { icon: Settings, label: t('settings'), path: '/settings' },
    { icon: Shield, label: t('privacy_policy'), path: '/privacy' },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'طمطوم - فواكه وخضروات طازجة',
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      toast({
        title: t('share'),
        description: language === 'ar' ? 'تم نسخ رابط التطبيق' : 'App link copied',
      });
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    toast({
      title: newLang === 'ar' ? 'Language Changed' : 'تم تغيير اللغة',
      description: newLang === 'ar' ? 'App is now in English' : 'التطبيق الآن باللغة العربية',
    });
  };

  return (
    <div className="bg-background min-h-screen flex flex-col pb-16 md:pb-0" dir={dir}>
      <TopBar />
      {location !== '/' && <Navbar />}

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button id="sidebar-trigger" className="hidden" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] p-0 flex flex-col border-none shadow-2xl">
          <div className="relative h-48 bg-gradient-to-br from-[#388e3c] to-[#2e7d32] overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <img 
                src={sidebarImageUrl} 
                alt="Sidebar background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/20" />
            <button 
              onClick={() => setSidebarOpen(false)}
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-2 text-white hover:bg-white/20 rounded-full transition-colors`}
            >
              <X className="h-6 w-6" />
            </button>
            <div className={`absolute bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} flex items-center gap-4`}>
              <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-2 overflow-hidden border-4 border-white/20">
                {getSetting('header_logo_url', '') ? (
                  <img 
                    src={getSetting('header_logo_url', '')} 
                    alt="Tamtom Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-2xl flex items-center font-black tracking-tighter select-none">
                    <span className="text-[#388e3c]">طم</span>
                    <span className="text-[#d32f2f]">طوم</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6">
            {/* Language Selector in Sidebar */}
            <div className="px-6 pb-6 border-b mb-6">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl">
                <div className="flex items-center gap-3 font-black text-sm uppercase tracking-wider">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>{t('language_country')}</span>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs h-8 px-4 rounded-full font-black shadow-lg shadow-primary/20"
                  onClick={toggleLanguage}
                >
                  {language === 'ar' ? 'ENGLISH' : 'العربية'}
                </Button>
              </div>
            </div>

            <div className="px-3 space-y-1">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setLocation(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {language === 'ar' ? (
                      <ChevronLeft className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                    ) : (
                      <ChevronRight className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                    )}
                    <div className="flex items-center gap-4">
                      <span className={`font-black uppercase tracking-wider ${isActive ? 'text-lg' : 'text-sm'}`}>{item.label}</span>
                      <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 border-t bg-muted/20">
            <div className="flex justify-center gap-4 mb-4">
              <button onClick={() => window.open(whatsappLink, '_blank')} className="p-3 bg-white shadow-sm border rounded-xl hover:text-green-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button onClick={handleShare} className="p-3 bg-white shadow-sm border rounded-xl hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.3em]">
              TAMTOM MARKET v1.0.0
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Elegant Design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t z-50 md:hidden flex items-center justify-around h-16 px-6 pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[1.5rem]">
        <button 
          onClick={() => setLocation('/')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${location === '/' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home className={`h-6 w-6 ${location === '/' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">الرئيسية</span>
          {location === '/' && <div className="h-1 w-4 bg-primary rounded-full mt-0.5" />}
        </button>

        <button 
          onClick={() => setLocation('/favorites')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${location === '/favorites' ? 'text-[#d32f2f] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Heart className={`h-6 w-6 ${location === '/favorites' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">المفضلة</span>
          {location === '/favorites' && <div className="h-1 w-4 bg-[#d32f2f] rounded-full mt-0.5" />}
        </button>

        <div className="relative -mt-10">
          <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center group">
                <div className="bg-gradient-to-br from-[#388e3c] to-[#2e7d32] text-white p-4 rounded-2xl shadow-2xl shadow-[#388e3c]/40 border-4 border-white transform transition-transform group-hover:scale-110 active:scale-95 group-active:rotate-12">
                  <MessageCircle className="h-7 w-7" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-t-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
              <div className="h-32 bg-gradient-to-br from-[#388e3c] to-[#2e7d32] p-8 flex items-end">
                <h2 className="text-3xl font-black text-white italic tracking-tighter">نحن معك..</h2>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-gray-500 font-bold mb-6 text-center">اختر وسيلة التواصل المناسبة لك</p>
                <div className="grid gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex items-center justify-between px-6 rounded-2xl border-2 border-green-50 hover:bg-green-50 hover:border-green-200 group transition-all"
                    onClick={() => {
                      window.open(whatsappLink, '_blank');
                      setSupportOpen(false);
                    }}
                  >
                    <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-right mr-4">
                      <p className="font-black text-xl text-gray-900">واتساب</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">تحدث مباشرة</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-300" />
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-20 flex items-center justify-between px-6 rounded-2xl border-2 border-blue-50 hover:bg-blue-50 hover:border-blue-200 group transition-all"
                    onClick={() => {
                      window.location.href = phoneLink;
                      setSupportOpen(false);
                    }}
                  >
                    <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                      <PhoneCall className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-right mr-4">
                      <p className="font-black text-xl text-gray-900">اتصال</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">مكالمة فورية</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-300" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-all duration-300"
        >
          <Share2 className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">مشاركة</span>
        </button>

        <button 
          onClick={() => setLocation(user ? '/profile' : '/auth')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${location === '/profile' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User className={`h-6 w-6 ${location === '/profile' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">حسابي</span>
          {location === '/profile' && <div className="h-1 w-4 bg-primary rounded-full mt-0.5" />}
        </button>
      </div>

      {/* Footer (Desktop) */}
      <footer className="hidden md:block bg-white border-t py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">عن طمطوم</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-right">
              <li>من نحن</li>
              <li>اتصل بنا</li>
              <li>الأسئلة الشائعة</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">مساعدة ودعم</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-right">
              <li>سياسة الشحن</li>
              <li>سياسة الإرجاع</li>
              <li>تتبع الطلب</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">قانوني</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-right">
              <li>سياسة الخصوصية</li>
              <li>شروط الخدمة</li>
            </ul>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-lg mb-4">تابعنا</h4>
            <div className="flex gap-4 justify-end">
               <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full">
                 <Share2 className="h-5 w-5 text-gray-600" />
               </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Cart Button */}
      {getItemCount() > 0 && (
        <div className="md:hidden">
          <CartButton />
        </div>
      )}
    </div>
  );
}
