import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Settings, 
  LogOut,
  Package,
  Truck,
  Store,
  Eye,
  Edit,
  Trash2,
  Star,
  Grid,
  Cog,
  Menu,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import RestaurantSections from './RestaurantSections';
import RatingsManagement from './RatingsManagement';
import SpecialOffers from './SpecialOffers';
import WalletManagement from './WalletManagement';
import RestaurantManagement from '../components/RestaurantManagement';
import AdminSettings from './AdminSettings';
import type { Order, Driver, Category } from '@shared/schema';

interface DashboardStats {
  stats: {
    totalRestaurants: number;
    totalOrders: number;
    totalDrivers: number;
    totalCustomers: number;
    todayOrders: number;
    pendingOrders: number;
    activeDrivers: number;
    totalRevenue: number;
    todayRevenue: number;
  };
  recentOrders: Order[];
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
  });

  const { data: drivers, isLoading: isDriversLoading } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: allOrders, isLoading: isOrdersLoading } = useQuery<{orders: Order[]}>({
    queryKey: ['/api/admin/orders'],
  });

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const stats = [
    { title: 'إجمالي الطلبات', value: dashboardData?.stats.totalOrders || '0', icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'العملاء النشطين', value: dashboardData?.stats.totalCustomers || '0', icon: Users, color: 'text-green-600' },
    { title: 'إجمالي المبيعات', value: `${dashboardData?.stats.totalRevenue.toLocaleString() || '0'} ريال`, icon: DollarSign, color: 'text-orange-600' },
    { title: 'السائقين النشطين', value: dashboardData?.stats.activeDrivers || '0', icon: Truck, color: 'text-purple-600' },
  ];

  const navigationItems = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
    { id: 'restaurants', label: 'المتاجر', icon: Store },
    { id: 'sections', label: 'أقسام المتاجر', icon: Grid },
    { id: 'drivers', label: 'السائقين', icon: Truck },
    { id: 'categories', label: 'الفئات', icon: Package },
    { id: 'offers', label: 'العروض', icon: Star },
    { id: 'wallets', label: 'المحافظ', icon: DollarSign },
    { id: 'ratings', label: 'التقييمات', icon: Star },
    { id: 'settings', label: 'الإعدادات', icon: Cog },
  ];

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>;
      case 'confirmed': return <Badge variant="default" className="bg-blue-100 text-blue-800">مؤكد</Badge>;
      case 'preparing': return <Badge variant="outline" className="bg-orange-100 text-orange-800">قيد التحضير</Badge>;
      case 'out_for_delivery': return <Badge variant="outline" className="bg-purple-100 text-purple-800">في الطريق</Badge>;
      case 'delivered': return <Badge variant="default" className="bg-green-100 text-green-800">تم التوصيل</Badge>;
      case 'cancelled': return <Badge variant="destructive">ملغي</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiRequest('PUT', `/api/admin/orders/${orderId}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false); // Close mobile sidebar when tab changes
  };

  // Sidebar Component for Desktop
  const SidebarContent = () => (
    <div className="w-64 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-xs text-gray-500">إدارة نظام التوصيل</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  activeTab === item.id 
                    ? "bg-blue-50 text-blue-700 border-blue-200" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleTabChange(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
      
      <div className="absolute bottom-4 right-4 left-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full flex items-center gap-2"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="right" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white shadow-sm border-b">
            <div className="px-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-xs text-gray-500">إدارة نظام التوصيل</p>
                  </div>
                </div>
                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      data-testid="button-mobile-menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>
            </div>
          </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="restaurants">المتاجر</TabsTrigger>
            <TabsTrigger value="sections">أقسام المتاجر</TabsTrigger>
            <TabsTrigger value="drivers">السائقين</TabsTrigger>
            <TabsTrigger value="categories">الفئات</TabsTrigger>
            <TabsTrigger value="offers">العروض</TabsTrigger>
            <TabsTrigger value="wallets">المحافظ</TabsTrigger>
            <TabsTrigger value="ratings">التقييمات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    الطلبات الحديثة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isDashboardLoading ? (
                      <p className="text-sm text-gray-500 text-center py-4">جاري التحميل...</p>
                    ) : dashboardData?.recentOrders.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">لا توجد طلبات حديثة</p>
                    ) : (
                      dashboardData?.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-bold text-sm">طلب #{order.orderNumber}</p>
                            <p className="text-xs text-gray-600">{order.customerName}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getOrderStatusBadge(order.status)}
                            <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString('ar-YE')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    السائقين النشطين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isDriversLoading ? (
                      <p className="text-sm text-gray-500 text-center py-4">جاري التحميل...</p>
                    ) : drivers?.filter(d => d.isActive).length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">لا يوجد سائقين نشطين حالياً</p>
                    ) : (
                      drivers?.filter(d => d.isActive).slice(0, 5).map((driver) => (
                        <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{driver.name}</p>
                              <p className="text-xs text-gray-600">{driver.phone}</p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            نشط
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة الطلبات</CardTitle>
                <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] })}>
                  تحديث القائمة
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isOrdersLoading ? (
                    <div className="text-center py-8">جاري تحميل الطلبات...</div>
                  ) : allOrders?.orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">لا توجد طلبات لعرضها</div>
                  ) : (
                    allOrders?.orders.map((order) => (
                      <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:border-blue-200 transition-all gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <p className="font-black text-blue-700">#{order.orderNumber}</p>
                            {getOrderStatusBadge(order.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <p className="text-sm font-bold">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerPhone}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('ar-YE')}</p>
                            <p className="text-xs font-black text-green-600">{order.totalAmount || order.total} ريال</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            className="text-xs border rounded p-1 h-8 bg-white"
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="confirmed">تأكيد الطلب</option>
                            <option value="preparing">قيد التحضير</option>
                            <option value="out_for_delivery">خرج للتوصيل</option>
                            <option value="delivered">تم التوصيل</option>
                            <option value="cancelled">إلغاء الطلب</option>
                          </select>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6">
            <RestaurantManagement />
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة السائقين</CardTitle>
                <Button size="sm">إضافة سائق جديد</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isDriversLoading ? (
                    <div className="col-span-full text-center py-8">جاري التحميل...</div>
                  ) : drivers?.map((driver) => (
                    <div key={driver.id} className="p-4 border rounded-xl bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant={driver.isActive ? "default" : "secondary"} 
                               className={driver.isActive ? "bg-green-100 text-green-800" : ""}>
                          {driver.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                        <p className="text-sm font-black text-blue-600">₪{driver.earnings || '0'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                          <Edit className="h-3 w-3 ml-1" /> تعديل
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3 ml-1" /> حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة الفئات</CardTitle>
                <Button size="sm">إضافة فئة جديدة</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {isCategoriesLoading ? (
                    <div className="col-span-full text-center py-8">جاري التحميل...</div>
                  ) : categories?.map((category) => (
                    <div key={category.id} className="p-4 border rounded-xl text-center hover:border-blue-300 transition-colors bg-white">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        {category.icon ? <i className={`${category.icon} text-xl text-blue-600`} /> : <Package className="h-6 w-6 text-gray-400" />}
                      </div>
                      <h4 className="font-bold mb-1">{category.name}</h4>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Badge variant="outline" className="text-[10px] h-5">{category.isActive ? 'نشط' : 'معطل'}</Badge>
                        <span className="text-[10px] text-gray-400">ترتيب: {category.sortOrder}</span>
                      </div>
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <RestaurantSections />
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <SpecialOffers />
          </TabsContent>

          <TabsContent value="wallets" className="space-y-6">
            <WalletManagement />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <RatingsManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
        </main>
        </div>
      </div>
    </div>
  );
};