import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BarChart3, 
  Store, 
  ShoppingBag, 
  Truck, 
  Percent, 
  Settings, 
  Menu,
  LogOut,
  Package,
  Users,
  Bell,
  User,
  Tag,
  DollarSign,
  Shield
} from 'lucide-react';
import type { UiSettings } from '@shared/schema';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: uiSettings } = useQuery<UiSettings[]>({
    queryKey: ['/api/admin/ui-settings'],
  });

  const getLogoUrl = () => {
    const logoSetting = uiSettings?.find(s => s.key === 'header_logo_url');
    return logoSetting?.value || '';
  };

  const getSidebarImageUrl = () => {
    const sidebarSetting = uiSettings?.find(s => s.key === 'sidebar_image_url');
    return sidebarSetting?.value || '';
  };

  const menuItems = [
    { 
      icon: BarChart3, 
      label: 'لوحة التحكم', 
      path: '/admin',
      description: 'نظرة عامة على النظام'
    },
    { 
      icon: ShoppingBag, 
      label: 'الطلبات', 
      path: '/admin/orders',
      description: 'إدارة جميع الطلبات'
    },
    { 
      icon: Tag, 
      label: 'التصنيفات', 
      path: '/admin/categories',
      description: 'إدارة فئات المتاجر'
    },
    { 
      icon: Package, 
      label: 'المنتجات', 
      path: '/admin/menu-items',
      description: 'إدارة المنتجات والأصناف'
    },
    { 
      icon: Truck, 
      label: 'السائقين', 
      path: '/admin/drivers',
      description: 'إدارة السائقين'
    },
    { 
      icon: DollarSign, 
      label: 'رسوم التوصيل', 
      path: '/admin/delivery-fees',
      description: 'إدارة رسوم ومناطق التوصيل'
    },
    { 
      icon: DollarSign, 
      label: 'التقارير المالية', 
      path: '/admin/financial-reports',
      description: 'مراقبة الأرباح والإيرادات'
    },
    { 
      icon: Users, 
      label: 'إدارة الموارد البشرية', 
      path: '/admin/hr-management',
      description: 'إدارة الموظفين والرواتب'
    },
    { 
      icon: Shield, 
      label: 'الأمن والخصوصية', 
      path: '/admin/security',
      description: 'إعدادات الأمان وسجلات الوصول'
    },
    { 
      icon: Percent, 
      label: 'العروض', 
      path: '/admin/offers',
      description: 'إدارة العروض الخاصة'
    },
    { 
      icon: Users, 
      label: 'المستخدمين', 
      path: '/admin/users',
      description: 'إدارة المستخدمين والصلاحيات'
    },
    { 
      icon: User, 
      label: 'الملف الشخصي', 
      path: '/admin/profile',
      description: 'إدارة معلومات الحساب'
    },
    { 
      icon: Settings, 
      label: 'إعدادات الواجهة', 
      path: '/admin/ui-settings',
      description: 'إدارة إعدادات التطبيق والواجهة'
    },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    // مسح بيانات المدير من localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Sidebar Image */}
      {getSidebarImageUrl() ? (
        <div className="w-full h-48 border-b overflow-hidden">
          <img 
            src={getSidebarImageUrl()} 
            alt="خلفية القائمة الجانبية" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">لوحة التحكم</h2>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">مدير النظام</p>
            <p className="text-xs text-gray-500">لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-primary'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
              <div className="flex-1">
                <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </p>
                <p className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row" dir="rtl">
      {/* Desktop Sidebar - Always visible on lg+ screens */}
      <aside className="hidden lg:block w-80 bg-white shadow-lg overflow-y-auto h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-auto">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {getLogoUrl() ? (
              <img 
                src={getLogoUrl()} 
                alt="شعار التطبيق" 
                className="h-10 object-contain"
              />
            ) : (
              <h1 className="font-bold text-gray-900 text-xl">طمطوم</h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Header with Sidebar Toggle */}
        <header className="lg:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            {getLogoUrl() ? (
              <img 
                src={getLogoUrl()} 
                alt="شعار التطبيق" 
                className="h-8 object-contain"
              />
            ) : (
              <h1 className="font-bold text-gray-900">طمطوم</h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};