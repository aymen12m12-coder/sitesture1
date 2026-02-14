import { useState } from 'react';
import { useLocation } from 'wouter';
import { Home, Search, Receipt, User, Menu, Settings, Shield, MapPin, Clock, Truck, UserCog, ShoppingCart } from 'lucide-react';
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
  
  
  // Get visibility settings from UiSettings
  const showAdminPanel = isFeatureEnabled('show_admin_panel');
  const showDeliveryApp = isFeatureEnabled('show_delivery_app'); 
  const showOrdersPage = isFeatureEnabled('show_orders_page');
  const showTrackOrdersPage = isFeatureEnabled('show_track_orders_page');

  const isAdminPage = location.startsWith('/admin');
  const isDeliveryPage = location.startsWith('/delivery');
  const isDriverPage = location.startsWith('/driver');

  // Skip custom layout for admin/driver pages as they have their own
  if (isAdminPage || isDeliveryPage || isDriverPage) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background min-h-screen">
      <TopBar />
      <Navbar />

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer (Simplified) */}
      <footer className="bg-white border-t py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">عن SHEIN</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-right">
              <li>معلومات الشركة</li>
              <li>المسؤولية الإجتماعية</li>
              <li>مركز الأخبار</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">مساعدة ودعم</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-right">
              <li>معلومات الشحن</li>
              <li>الإرجاع</li>
              <li>كيفية الطلب</li>
              <li>دليل المقاسات</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-right">
              <li>اتصل بنا</li>
              <li>طرق الدفع</li>
              <li>نقاط المكافأة</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-right">تواصل معنا</h4>
            <div className="flex gap-4 justify-end">
              {/* Social icons would go here */}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Cart Button */}
      {getItemCount() > 0 && <CartButton />}
    </div>
  );
}
