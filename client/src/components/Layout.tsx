import { useState } from 'react';
import { useLocation } from 'wouter';
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
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '../contexts/CartContext';
import CartButton from './CartButton';
import { useToast } from '@/hooks/use-toast';
import { useUiSettings } from '@/context/UiSettingsContext';
import TopBar from './TopBar';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}


export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { state } = useCart();
  const getItemCount = () => state.items.reduce((sum, item) => sum + item.quantity, 0);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isFeatureEnabled } = useUiSettings();
  
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

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <TopBar />
      <Navbar />

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button id="sidebar-trigger" className="hidden" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
          <SheetHeader className="p-6 border-b text-right">
            <SheetTitle className="text-2xl font-black text-primary flex items-center justify-end gap-2">
              طمطوم <span className="text-xs text-black opacity-50">FRESH</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
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

      {/* Footer */}
      <footer className="bg-white border-t py-12 mt-auto">
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
               {/* Icons would go here */}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Cart Button */}
      {getItemCount() > 0 && <CartButton />}
    </div>
  );
}
