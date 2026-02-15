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
  PhoneCall,
  Info,
  ChevronLeft,
  Globe,
  Share2,
  MessageCircle,
  MoreVertical,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '../contexts/CartContext';
import CartButton from './CartButton';
import { useToast } from '@/hooks/use-toast';
import { useUiSettings } from '@/context/UiSettingsContext';
import TopBar from './TopBar';
import Navbar from './Navbar';
import { apiRequest } from '@/lib/queryClient';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { state } = useCart();
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
  
  const isAdminPage = location.startsWith('/admin');
  const isDeliveryPage = location.startsWith('/delivery');
  const isDriverPage = location.startsWith('/driver');

  if (isAdminPage || isDeliveryPage || isDriverPage) {
    return <>{children}</>;
  }

  const sidebarMenuItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: Receipt, label: 'طلباتي', path: '/orders' },
    { icon: User, label: 'حسابي', path: '/profile' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
    { icon: PhoneCall, label: 'اتصل بنا', path: '/contact' },
    { icon: Info, label: 'عن طمطوم', path: '/about' },
    { icon: Shield, label: 'سياسة الخصوصية', path: '/privacy' },
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
        title: "مشاركة التطبيق",
        description: "تم نسخ رابط التطبيق",
      });
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col pb-16 md:pb-0">
      <TopBar />
      <Navbar />

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button id="sidebar-trigger" className="hidden" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
          <SheetHeader className="p-6 border-b text-right">
            <SheetTitle className="text-2xl font-black flex items-center justify-end gap-2">
              <div className="logo-tamtom">
                <span className="green">طم</span>
                <span className="red">طوم</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {/* Language Selector in Sidebar */}
            <div className="px-6 py-4 border-b mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>اللغة والبلد</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                  اليمن / العربية
                </Button>
              </div>
            </div>

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
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
                    isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <ChevronLeft className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{item.label}</span>
                    <Icon className="h-5 w-5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-6 border-t bg-muted/50">
            <p className="text-xs text-center text-muted-foreground">
              نسخة التطبيق 1.0.0 &copy; 2024 طمطوم
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:hidden flex items-center justify-around h-16 px-4">
        <button 
          onClick={() => setLocation('/')}
          className={`flex flex-col items-center gap-1 ${location === '/' ? 'text-primary' : 'text-gray-500'}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-1 text-gray-500">
              <div className="bg-primary text-white p-3 rounded-full -mt-8 shadow-lg border-4 border-white transform transition-transform hover:scale-110 active:scale-95">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold mt-1">الدعم</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-t-[2rem] border-none">
            <DialogHeader className="text-center pb-4">
              <DialogTitle className="text-2xl font-black text-gray-900">كيف يمكننا مساعدتك؟</DialogTitle>
              <p className="text-gray-500 font-bold">نحن متواجدون لخدمتك في أي وقت</p>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <Button 
                variant="outline" 
                className="h-16 flex items-center justify-between px-6 rounded-2xl border-2 border-green-100 hover:bg-green-50 hover:border-green-200 group transition-all"
                onClick={() => {
                  window.open(whatsappLink, '_blank');
                  setSupportOpen(false);
                }}
              >
                <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 text-right mr-4">
                  <p className="font-black text-lg">واتساب</p>
                  <p className="text-xs text-gray-500">تحدث معنا مباشرة</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </Button>

              <Button 
                variant="outline" 
                className="h-16 flex items-center justify-between px-6 rounded-2xl border-2 border-blue-100 hover:bg-blue-50 hover:border-blue-200 group transition-all"
                onClick={() => {
                  window.location.href = phoneLink;
                  setSupportOpen(false);
                }}
              >
                <div className="bg-blue-100 p-2 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <PhoneCall className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-right mr-4">
                  <p className="font-black text-lg">اتصال مباشر</p>
                  <p className="text-xs text-gray-500">مكالمة هاتفية فورية</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <Share2 className="h-6 w-6" />
          <span className="text-[10px] font-bold">مشاركة</span>
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
